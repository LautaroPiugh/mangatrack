const { isValidObjectId } = require('mongoose');

const mangaRepository = require('../repositories/manga.repository');
const reviewRepository = require('../repositories/review.repository');
const userRepository = require('../repositories/user.repository');
const externalMangaService = require('./externalManga.service');
const { BadRequestError, ConflictError, NotFoundError } = require('../utils/errors');
const {
  MANGA_SORT_OPTIONS,
  EXTERNAL_MANGA_SOURCES,
  generateSlug,
  normalizeGenres,
  normalizeMangaSlug,
  normalizeTitleForMatching,
} = require('../utils/manga');
const { normalizeOptionalString } = require('../utils/user');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

const parsePagination = (query = {}) => {
  const page = Math.max(Number.parseInt(query.page, 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: total === 0 ? 0 : Math.ceil(total / limit),
});

const ensureValidMangaId = (mangaId) => {
  if (!isValidObjectId(mangaId)) {
    throw new BadRequestError('El id del manga no es valido.');
  }
};

const buildSortOption = (sort = 'latest') => {
  if (!MANGA_SORT_OPTIONS.includes(sort)) {
    return { createdAt: -1 };
  }

  switch (sort) {
    case 'rating':
      return { averageRating: -1, ratingsCount: -1, title: 1 };
    case 'popular':
      return { ratingsCount: -1, averageRating: -1, title: 1 };
    case 'title':
      return { title: 1 };
    case 'latest':
    default:
      return { createdAt: -1 };
  }
};

const buildMangaReviewSort = (sort = 'recent') => {
  if (sort === 'rating') {
    return { rating: -1, createdAt: -1 };
  }

  return { createdAt: -1 };
};

const pickMangaPayload = (payload = {}) => {
  const mangaPayload = {};

  if (payload.title !== undefined) {
    mangaPayload.title = payload.title.trim();
    mangaPayload.normalizedTitle = normalizeTitleForMatching(payload.title);
  }

  if (payload.slug !== undefined) {
    mangaPayload.slug = normalizeMangaSlug(payload.slug);
  }

  if (payload.synopsis !== undefined) {
    mangaPayload.synopsis = normalizeOptionalString(payload.synopsis);
  }

  if (payload.author !== undefined) {
    mangaPayload.author = normalizeOptionalString(payload.author);
  }

  if (payload.artist !== undefined) {
    mangaPayload.artist = normalizeOptionalString(payload.artist);
  }

  if (payload.genres !== undefined) {
    mangaPayload.genres = normalizeGenres(payload.genres);
  }

  if (payload.coverUrl !== undefined) {
    mangaPayload.coverUrl = normalizeOptionalString(payload.coverUrl);
  }

  if (payload.status !== undefined) {
    mangaPayload.status = payload.status;
  }

  if (payload.chapters !== undefined) {
    mangaPayload.chapters = Number(payload.chapters);
  }

  if (payload.publishedFrom !== undefined) {
    mangaPayload.publishedFrom = payload.publishedFrom || null;
  }

  if (payload.publishedTo !== undefined) {
    mangaPayload.publishedTo = payload.publishedTo || null;
  }

  return mangaPayload;
};

const pickPrimaryAuthor = (authors = []) => authors[0] || null;
const pickPrimaryArtist = (authors = []) => authors[1] || authors[0] || null;
const parsePositiveInteger = (value) => {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
};

const buildImportFingerprint = (externalManga = {}) => {
  const title = externalManga.title || '';
  const slug = generateSlug(title) || null;

  return {
    externalSource: externalManga.source,
    externalId: parsePositiveInteger(externalManga.externalId),
    normalizedTitle: normalizeTitleForMatching(title),
    slug,
    title,
  };
};

const resolveDuplicateReason = (manga, fingerprint) => {
  if (
    manga?.external?.source
    && manga?.external?.externalId
    && manga.external.source === fingerprint.externalSource
    && Number(manga.external.externalId) === Number(fingerprint.externalId)
  ) {
    return 'external_source_id';
  }

  if (fingerprint.slug && manga?.slug === fingerprint.slug) {
    return 'slug';
  }

  if (fingerprint.normalizedTitle && manga?.normalizedTitle === fingerprint.normalizedTitle) {
    return 'normalized_title';
  }

  return 'title';
};

const buildImportedMangaPayload = (externalManga = {}, userId) => {
  const generatedSlug = generateSlug(externalManga.title || '') || `${externalManga.source || 'external'}-${externalManga.externalId}`;
  const authors = Array.isArray(externalManga.authors) ? externalManga.authors : [];
  const normalizedGenres = normalizeGenres(externalManga.genres);

  return {
    title: externalManga.title,
    normalizedTitle: normalizeTitleForMatching(externalManga.title),
    slug: generatedSlug,
    synopsis: normalizeOptionalString(externalManga.synopsis),
    author: normalizeOptionalString(externalManga.author || pickPrimaryAuthor(authors)),
    artist: normalizeOptionalString(externalManga.artist || pickPrimaryArtist(authors)),
    genres: normalizedGenres,
    coverUrl: normalizeOptionalString(externalManga.coverImage || externalManga.coverUrl),
    status: externalManga.status || 'ongoing',
    chapters: externalManga.chapters ?? undefined,
    publishedFrom: externalManga.publishedFrom || null,
    publishedTo: externalManga.publishedTo || null,
    createdBy: userId || null,
    external: {
      source: externalManga.source,
      externalId: parsePositiveInteger(externalManga.externalId),
      url: normalizeOptionalString(externalManga.url),
      bannerImage: normalizeOptionalString(externalManga.bannerImage),
      titleEnglish: normalizeOptionalString(externalManga.titleEnglish),
      titleJapanese: normalizeOptionalString(externalManga.titleJapanese),
      titleSynonyms: normalizeOptionalArray(externalManga.titleSynonyms),
      authors: normalizeOptionalArray(authors),
      type: normalizeOptionalString(externalManga.type),
      volumes: externalManga.volumes ?? null,
      score: externalManga.score ?? null,
      rank: externalManga.rank ?? null,
      popularity: externalManga.popularity ?? null,
    },
  };
};

const normalizeOptionalArray = (values = []) => [...new Set(
  values
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean),
)];

const getAllMangas = async (query = {}) => {
  const filters = {};
  const { page, limit, skip } = parsePagination(query);
  const sort = buildSortOption(query.sort);

  if (query.q || query.search) {
    filters.q = (query.q || query.search).trim();
  }

  if (query.genre) {
    filters.genre = query.genre.trim();
  }

  if (query.status) {
    filters.status = query.status;
  }

  const [items, total] = await Promise.all([
    mangaRepository.findAll(filters, { skip, limit, sort }),
    mangaRepository.countDocuments(filters),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

const getMangaByIdOrSlug = async (idOrSlug, currentUser = null) => {
  const manga = await mangaRepository.findByIdOrSlug(idOrSlug);

  if (!manga) {
    throw new NotFoundError('Manga no encontrado.');
  }

  const mangaData = manga.toObject();
  mangaData.reviewSummary = {
    averageRating: manga.averageRating,
    totalReviews: manga.ratingsCount,
  };
  mangaData.isFavorite = false;
  mangaData.isInWatchlist = false;
  mangaData.userReview = null;

  if (currentUser?.id) {
    const [currentUserDocument, userReview] = await Promise.all([
      userRepository.findById(currentUser.id),
      reviewRepository.findByUserAndManga(currentUser.id, manga._id),
    ]);

    if (currentUserDocument) {
      mangaData.isFavorite = (currentUserDocument.favorites || [])
        .some((item) => item.toString() === manga._id.toString());
      mangaData.isInWatchlist = (currentUserDocument.watchlist || [])
        .some((item) => item.toString() === manga._id.toString());
    }

    if (userReview) {
      mangaData.userReview = typeof userReview.toObject === 'function'
        ? userReview.toObject()
        : userReview;
    }
  }

  return mangaData;
};

const createManga = async (payload, userId) => {
  const mangaPayload = pickMangaPayload(payload);
  const generatedSlug = mangaPayload.slug || generateSlug(mangaPayload.title || '');

  if (!generatedSlug) {
    throw new BadRequestError('No se pudo generar un slug valido para el manga.');
  }

  if (await mangaRepository.existsBySlug(generatedSlug)) {
    throw new ConflictError('Ya existe un manga registrado con ese slug.');
  }

  return mangaRepository.create({
    ...mangaPayload,
    slug: generatedSlug,
    createdBy: userId || null,
  });
};

const importExternalManga = async (payload = {}, userId) => {
  const source = payload.source || payload.manga?.source || 'jikan';

  if (!EXTERNAL_MANGA_SOURCES.includes(source)) {
    throw new BadRequestError('La fuente externa indicada no es valida.');
  }

  if (!payload.malId && !payload.manga?.externalId) {
    throw new BadRequestError('Debes enviar un malId o un manga externo normalizado.');
  }

  console.info('[external-manga] import requested', {
    source,
    malId: payload.malId || payload.manga?.externalId || null,
    requestedBy: userId || null,
  });

  let externalManga = payload.manga || null;

  if (!externalManga || !externalManga.title || !externalManga.externalId) {
    externalManga = await externalMangaService.getExternalMangaById(payload.malId || payload.manga?.externalId);
  }

  if (externalManga.source !== source) {
    externalManga = {
      ...externalManga,
      source,
    };
  }

  const fingerprint = buildImportFingerprint(externalManga);
  const duplicate = await mangaRepository.findImportCandidate(fingerprint, {
    populateCreatedBy: false,
  });

  if (duplicate) {
    const duplicateReason = resolveDuplicateReason(duplicate, fingerprint);

    console.info('[external-manga] import skipped duplicate', {
      source,
      externalId: externalManga.externalId,
      duplicateId: duplicate._id.toString(),
      duplicateSlug: duplicate.slug,
      reason: duplicateReason,
    });

    return {
      manga: duplicate,
      imported: false,
      duplicate: true,
      duplicateReason,
      message: 'El manga ya existe en MangaTrack.',
    };
  }

  const createdManga = await mangaRepository.create(buildImportedMangaPayload(externalManga, userId));

  console.info('[external-manga] import created', {
    source,
    externalId: externalManga.externalId,
    mangaId: createdManga._id.toString(),
    slug: createdManga.slug,
  });

  return {
    manga: createdManga,
    imported: true,
    duplicate: false,
    duplicateReason: null,
    message: 'Manga importado correctamente.',
  };
};

const updateManga = async (mangaId, payload) => {
  ensureValidMangaId(mangaId);

  const existingManga = await mangaRepository.findById(mangaId, {
    populateCreatedBy: false,
  });

  if (!existingManga) {
    throw new NotFoundError('Manga no encontrado.');
  }

  const mangaPayload = pickMangaPayload(payload);

  if (mangaPayload.slug) {
    const mangaWithSlug = await mangaRepository.findBySlug(mangaPayload.slug, {
      populateCreatedBy: false,
    });

    if (mangaWithSlug && mangaWithSlug._id.toString() !== existingManga._id.toString()) {
      throw new ConflictError('Ya existe un manga registrado con ese slug.');
    }
  }

  if (Object.keys(mangaPayload).length === 0) {
    throw new BadRequestError('Debes enviar al menos un campo para actualizar el manga.');
  }

  return mangaRepository.updateById(mangaId, mangaPayload);
};

const deleteManga = async (mangaId) => {
  ensureValidMangaId(mangaId);

  const existingManga = await mangaRepository.findById(mangaId);

  if (!existingManga) {
    throw new NotFoundError('Manga no encontrado.');
  }

  await mangaRepository.deleteById(mangaId);
  await reviewRepository.deleteManyByMangaId(mangaId);

  return existingManga;
};

const getMangaReviews = async (mangaId, query = {}) => {
  ensureValidMangaId(mangaId);

  const manga = await mangaRepository.findById(mangaId);

  if (!manga) {
    throw new NotFoundError('Manga no encontrado.');
  }

  const filters = {};
  const { page, limit, skip } = parsePagination(query);
  filters.isPublic = true;
  const sort = buildMangaReviewSort(query.sort);

  const [items, total] = await Promise.all([
    reviewRepository.findByMangaId(mangaId, filters, { skip, limit, sort }),
    reviewRepository.countDocuments({ ...filters, manga: mangaId }),
  ]);

  return {
    manga,
    items,
    reviewSummary: {
      averageRating: manga.averageRating,
      totalReviews: manga.ratingsCount,
    },
    pagination: buildPaginationMeta(total, page, limit),
  };
};

module.exports = {
  getAllMangas,
  getMangaByIdOrSlug,
  createManga,
  importExternalManga,
  updateManga,
  deleteManga,
  getMangaReviews,
};
