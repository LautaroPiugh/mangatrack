const Manga = require('../models/Manga');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildMangaFilters = (filters = {}) => {
  const query = {};

  if (filters.q) {
    const regex = new RegExp(escapeRegex(filters.q.trim()), 'i');
    query.$or = [{ title: regex }, { author: regex }, { artist: regex }, { genres: regex }];
  }

  if (filters.genre) {
    query.genres = new RegExp(`^${escapeRegex(filters.genre.trim())}$`, 'i');
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.createdBy) {
    query.createdBy = filters.createdBy;
  }

  return query;
};

const applyMangaOptions = (query, options = {}) => {
  query.sort(options.sort || { createdAt: -1 });

  if (options.populateCreatedBy !== false) {
    query.populate({ path: 'createdBy', select: 'name username email role' });
  }

  if (Number.isInteger(options.skip) && options.skip >= 0) {
    query.skip(options.skip);
  }

  if (Number.isInteger(options.limit) && options.limit > 0) {
    query.limit(options.limit);
  }

  return query;
};

const findAll = (filters = {}, options = {}) => {
  const query = Manga.find(buildMangaFilters(filters));
  applyMangaOptions(query, options);
  return query.exec();
};

const findBySlug = (slug, options = {}) => {
  const query = Manga.findOne({ slug });
  applyMangaOptions(query, { populateCreatedBy: options.populateCreatedBy });
  return query.exec();
};

const findByIdOrSlug = (idOrSlug, options = {}) => {
  if (/^[a-f\d]{24}$/i.test(idOrSlug)) {
    return findById(idOrSlug, options);
  }

  return findBySlug(idOrSlug, options);
};

const findById = (id, options = {}) => {
  const query = Manga.findById(id);
  applyMangaOptions(query, { populateCreatedBy: options.populateCreatedBy });
  return query.exec();
};

const findByNormalizedTitle = (normalizedTitle, options = {}) => {
  const query = Manga.findOne({ normalizedTitle });
  applyMangaOptions(query, { populateCreatedBy: options.populateCreatedBy });
  return query.exec();
};

const searchByTitle = async (search, options = {}) => {
  const regex = new RegExp(escapeRegex(search.trim()), 'i');
  const limit = Number.isInteger(options.limit) && options.limit > 0 ? options.limit : 6;

  const items = await Manga.find({ title: regex })
    .sort({ title: 1 })
    .limit(limit)
    .select('title slug coverUrl')
    .lean()
    .exec();

  return items.map((item) => ({
    id: item._id.toString(),
    title: item.title,
    slug: item.slug,
    cover: item.coverUrl || null,
    coverUrl: item.coverUrl || null,
  }));
};

const findByExternalSourceAndId = (source, externalId, options = {}) => {
  const query = Manga.findOne({
    'external.source': source,
    'external.externalId': externalId,
  });

  applyMangaOptions(query, { populateCreatedBy: options.populateCreatedBy });

  return query.exec();
};

const findImportCandidate = (fingerprint = {}, options = {}) => {
  const filters = [];

  if (fingerprint.externalSource && Number.isInteger(fingerprint.externalId)) {
    filters.push({
      'external.source': fingerprint.externalSource,
      'external.externalId': fingerprint.externalId,
    });
  }

  if (fingerprint.slug) {
    filters.push({ slug: fingerprint.slug });
  }

  if (fingerprint.normalizedTitle) {
    filters.push({ normalizedTitle: fingerprint.normalizedTitle });
  }

  if (fingerprint.title) {
    filters.push({ title: new RegExp(`^${escapeRegex(fingerprint.title.trim())}$`, 'i') });
  }

  if (filters.length === 0) {
    return Promise.resolve(null);
  }

  const query = Manga.findOne({ $or: filters });
  applyMangaOptions(query, { populateCreatedBy: options.populateCreatedBy });

  return query.exec();
};

const existsById = async (id) => Boolean(await Manga.exists({ _id: id }));
const existsBySlug = async (slug) => Boolean(await Manga.exists({ slug }));

const countDocuments = (filters = {}) => Manga.countDocuments(buildMangaFilters(filters));

const create = (mangaData) => Manga.create(mangaData);

const updateById = (id, updateData, options = {}) => {
  const query = Manga.findByIdAndUpdate(
    id,
    updateData,
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );

  applyMangaOptions(query, { populateCreatedBy: options.populateCreatedBy });

  return query.exec();
};

const updateRatingSummary = (id, { averageRating, ratingsCount }) => Manga.findByIdAndUpdate(
  id,
  {
    averageRating,
    ratingsCount,
  },
  {
    returnDocument: 'after',
    runValidators: true,
  },
).exec();

const deleteById = (id) => Manga.findByIdAndDelete(id).exec();

module.exports = {
  findAll,
  findById,
  findBySlug,
  findByIdOrSlug,
  findByNormalizedTitle,
  searchByTitle,
  findByExternalSourceAndId,
  findImportCandidate,
  existsById,
  existsBySlug,
  countDocuments,
  create,
  updateById,
  updateRatingSummary,
  deleteById,
};
