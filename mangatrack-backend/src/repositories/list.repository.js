const MangaList = require('../models/MangaList');

const mangaCardProjection = 'title slug author artist genres coverUrl status averageRating ratingsCount';
const ownerProjection = 'name username displayName avatar bio createdAt';

const buildListFilters = (filters = {}) => {
  const query = {};

  if (filters.owner) {
    query.owner = filters.owner;
  }

  if (filters.visibility) {
    query.visibility = filters.visibility;
  }

  if (typeof filters.isDefault === 'boolean') {
    query.isDefault = filters.isDefault;
  }

  return query;
};

const applyListOptions = (query, options = {}) => {
  query.sort(options.sort || { updatedAt: -1 });

  if (options.populateOwner !== false) {
    query.populate({
      path: 'owner',
      select: ownerProjection,
    });
  }

  if (options.populateItems !== false) {
    query.populate({
      path: 'items.manga',
      select: mangaCardProjection,
    });
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
  const query = MangaList.find(buildListFilters(filters));
  applyListOptions(query, options);
  return query.exec();
};

const findById = (id, options = {}) => {
  const query = MangaList.findById(id);
  applyListOptions(query, options);
  return query.exec();
};

const findByIdAndOwner = (id, ownerId, options = {}) => {
  const query = MangaList.findOne({
    _id: id,
    owner: ownerId,
  });
  applyListOptions(query, options);
  return query.exec();
};

const findByOwnerId = (ownerId, filters = {}, options = {}) => {
  const query = MangaList.find(buildListFilters({
    ...filters,
    owner: ownerId,
  }));
  applyListOptions(query, options);
  return query.exec();
};

const findOneByOwnerAndTitle = (ownerId, title, options = {}) => {
  const query = MangaList.findOne({
    owner: ownerId,
    title: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
  });
  applyListOptions(query, options);
  return query.exec();
};

const countDocuments = (filters = {}) => MangaList.countDocuments(buildListFilters(filters));

const create = (payload) => MangaList.create(payload);
const insertMany = (payload) => MangaList.insertMany(payload, { ordered: false });

const updateById = (id, payload, options = {}) => {
  const query = MangaList.findByIdAndUpdate(
    id,
    payload,
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );

  applyListOptions(query, options);
  return query.exec();
};

const deleteById = (id) => MangaList.findByIdAndDelete(id).exec();

module.exports = {
  findAll,
  findById,
  findByIdAndOwner,
  findByOwnerId,
  findOneByOwnerAndTitle,
  countDocuments,
  create,
  insertMany,
  updateById,
  deleteById,
};
