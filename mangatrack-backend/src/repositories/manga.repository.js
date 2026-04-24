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

const existsById = async (id) => Boolean(await Manga.exists({ _id: id }));
const existsBySlug = async (slug) => Boolean(await Manga.exists({ slug }));

const countDocuments = (filters = {}) => Manga.countDocuments(buildMangaFilters(filters));

const create = (mangaData) => Manga.create(mangaData);

const updateById = (id, updateData, options = {}) => {
  const query = Manga.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
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
    new: true,
    runValidators: true,
  },
).exec();

const deleteById = (id) => Manga.findByIdAndDelete(id).exec();

module.exports = {
  findAll,
  findById,
  findBySlug,
  findByIdOrSlug,
  existsById,
  existsBySlug,
  countDocuments,
  create,
  updateById,
  updateRatingSummary,
  deleteById,
};
