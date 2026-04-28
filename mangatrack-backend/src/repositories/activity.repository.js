const { Activity } = require('../models/Activity');

const userProjection = 'name username displayName avatar bio createdAt';
const mangaProjection = 'title slug author artist genres coverUrl status averageRating ratingsCount';
const listProjection = 'title visibility description updatedAt';
const reviewProjection = 'rating content createdAt updatedAt isPublic';

const buildActivityFilters = (filters = {}) => {
  const query = {};

  if (filters.user) {
    query.user = filters.user;
  }

  if (Array.isArray(filters.userIds)) {
    query.user = {
      $in: filters.userIds,
    };
  }

  if (filters.visibility) {
    query.visibility = filters.visibility;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (Array.isArray(filters.types) && filters.types.length > 0) {
    query.type = {
      $in: filters.types,
    };
  }

  return query;
};

const applyActivityOptions = (query, options = {}) => {
  query.sort(options.sort || { createdAt: -1 });

  if (options.populate !== false) {
    query.populate({
      path: 'user',
      select: userProjection,
    });
    query.populate({
      path: 'manga',
      select: mangaProjection,
    });
    query.populate({
      path: 'list',
      select: listProjection,
    });
    query.populate({
      path: 'review',
      select: reviewProjection,
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
  const query = Activity.find(buildActivityFilters(filters));
  applyActivityOptions(query, options);
  return query.exec();
};

const countDocuments = (filters = {}) => Activity.countDocuments(buildActivityFilters(filters));

const create = async (payload, options = {}) => {
  const created = await Activity.create(payload);

  if (options.populate === false) {
    return created;
  }

  return findById(created._id);
};

const findById = (id, options = {}) => {
  const query = Activity.findById(id);
  applyActivityOptions(query, options);
  return query.exec();
};

module.exports = {
  findAll,
  findById,
  countDocuments,
  create,
};
