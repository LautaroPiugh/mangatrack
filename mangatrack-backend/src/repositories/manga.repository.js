const Manga = require('../models/Manga');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildMangaFilters = (filters = {}) => {
  const query = {};

  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search.trim()), 'i');
    query.$or = [{ title: regex }, { author: regex }, { genre: regex }];
  }

  if (filters.genre) {
    query.genre = new RegExp(`^${escapeRegex(filters.genre.trim())}$`, 'i');
  }

  if (filters.createdBy) {
    query.createdBy = filters.createdBy;
  }

  return query;
};

const applyMangaOptions = (query, options = {}) => {
  query.sort(options.sort || { createdAt: -1 });

  if (options.populateCreatedBy !== false) {
    query.populate({ path: 'createdBy', select: 'name email isVerified' });
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

const findById = (id, options = {}) => {
  const query = Manga.findById(id);
  applyMangaOptions(query, { populateCreatedBy: options.populateCreatedBy });
  return query.exec();
};

const existsById = async (id) => Boolean(await Manga.exists({ _id: id }));

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

const deleteById = (id) => Manga.findByIdAndDelete(id).exec();

module.exports = {
  findAll,
  findById,
  existsById,
  countDocuments,
  create,
  updateById,
  deleteById,
};
