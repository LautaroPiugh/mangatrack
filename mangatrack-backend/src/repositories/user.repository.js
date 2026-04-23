const User = require('../models/User');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSensitiveProjection = (options = {}) => {
  const projection = [];

  if (options.includePassword) {
    projection.push('+password');
  }

  if (options.includeVerificationToken) {
    projection.push('+verificationToken');
  }

  return projection.join(' ');
};

const buildUserFilters = (filters = {}) => {
  const query = {};

  if (typeof filters.isVerified === 'boolean') {
    query.isVerified = filters.isVerified;
  }

  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search.trim()), 'i');
    query.$or = [{ name: regex }, { email: regex }];
  }

  return query;
};

const applyUserListOptions = (query, options = {}) => {
  query.sort(options.sort || { createdAt: -1 });

  if (Number.isInteger(options.skip) && options.skip >= 0) {
    query.skip(options.skip);
  }

  if (Number.isInteger(options.limit) && options.limit > 0) {
    query.limit(options.limit);
  }

  const sensitiveProjection = buildSensitiveProjection(options);
  if (sensitiveProjection) {
    query.select(sensitiveProjection);
  }

  return query;
};

const findAll = (filters = {}, options = {}) => {
  const query = User.find(buildUserFilters(filters));
  applyUserListOptions(query, options);
  return query.exec();
};

const findById = (id, options = {}) => {
  const query = User.findById(id);
  const sensitiveProjection = buildSensitiveProjection(options);

  if (sensitiveProjection) {
    query.select(sensitiveProjection);
  }

  return query.exec();
};

const findByEmail = (email, options = {}) => {
  const query = User.findOne({ email: email.toLowerCase().trim() });
  const sensitiveProjection = buildSensitiveProjection(options);

  if (sensitiveProjection) {
    query.select(sensitiveProjection);
  }

  return query.exec();
};

const findByVerificationToken = (verificationToken, options = {}) => {
  const query = User.findOne({ verificationToken });
  const sensitiveProjection = buildSensitiveProjection({
    includeVerificationToken: true,
    ...options,
  });

  if (sensitiveProjection) {
    query.select(sensitiveProjection);
  }

  return query.exec();
};

const existsById = async (id) => Boolean(await User.exists({ _id: id }));

const existsByEmail = async (email) => Boolean(
  await User.exists({ email: email.toLowerCase().trim() }),
);

const countDocuments = (filters = {}) => User.countDocuments(buildUserFilters(filters));

const create = (userData) => User.create(userData);

const updateById = (id, updateData, options = {}) => {
  const query = User.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  const sensitiveProjection = buildSensitiveProjection(options);
  if (sensitiveProjection) {
    query.select(sensitiveProjection);
  }

  return query.exec();
};

const markAsVerified = (id) => User.findByIdAndUpdate(
  id,
  {
    isVerified: true,
    verificationToken: null,
  },
  {
    new: true,
    runValidators: true,
  },
).exec();

const deleteById = (id) => User.findByIdAndDelete(id).exec();

module.exports = {
  findAll,
  findById,
  findByEmail,
  findByVerificationToken,
  existsById,
  existsByEmail,
  countDocuments,
  create,
  updateById,
  markAsVerified,
  deleteById,
};
