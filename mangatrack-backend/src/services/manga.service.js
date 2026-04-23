const { isValidObjectId } = require('mongoose');

const mangaRepository = require('../repositories/manga.repository');
const reviewRepository = require('../repositories/review.repository');
const { BadRequestError, NotFoundError } = require('../utils/errors');

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

const pickMangaPayload = (payload = {}) => {
  const mangaPayload = {};

  if (payload.title !== undefined) {
    mangaPayload.title = payload.title.trim();
  }

  if (payload.author !== undefined) {
    mangaPayload.author = payload.author.trim();
  }

  if (payload.genre !== undefined) {
    mangaPayload.genre = payload.genre.trim();
  }

  if (payload.description !== undefined) {
    mangaPayload.description = payload.description.trim();
  }

  if (payload.coverImage !== undefined) {
    mangaPayload.coverImage = payload.coverImage ? payload.coverImage.trim() : null;
  }

  return mangaPayload;
};

const getAllMangas = async (query = {}) => {
  const filters = {};
  const { page, limit, skip } = parsePagination(query);

  if (query.search) {
    filters.search = query.search.trim();
  }

  if (query.genre) {
    filters.genre = query.genre.trim();
  }

  const [items, total] = await Promise.all([
    mangaRepository.findAll(filters, { skip, limit }),
    mangaRepository.countDocuments(filters),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

const getMangaById = async (mangaId) => {
  ensureValidMangaId(mangaId);

  const [manga, reviewSummary] = await Promise.all([
    mangaRepository.findById(mangaId),
    reviewRepository.getAverageRatingByMangaId(mangaId),
  ]);

  if (!manga) {
    throw new NotFoundError('Manga no encontrado.');
  }

  const mangaData = manga.toObject();
  mangaData.reviewSummary = reviewSummary;

  return mangaData;
};

const createManga = async (payload, userId) => {
  const mangaPayload = pickMangaPayload(payload);

  return mangaRepository.create({
    ...mangaPayload,
    createdBy: userId || null,
  });
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

  if (query.status) {
    filters.status = query.status;
  }

  const [items, total, reviewSummary] = await Promise.all([
    reviewRepository.findByMangaId(mangaId, filters, { skip, limit }),
    reviewRepository.countDocuments({ ...filters, manga: mangaId }),
    reviewRepository.getAverageRatingByMangaId(mangaId),
  ]);

  return {
    manga,
    items,
    reviewSummary,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

module.exports = {
  getAllMangas,
  getMangaById,
  createManga,
  updateManga,
  deleteManga,
  getMangaReviews,
};
