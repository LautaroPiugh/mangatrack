const User = require('../models/User');
const { normalizeEmail, normalizeUsername } = require('../utils/user');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const mangaCardProjection = 'title slug author artist genres coverUrl status averageRating ratingsCount';
const publicUserProjection = 'name username displayName avatar bio createdAt';
const libraryPopulation = {
  favorites: {
    path: 'favorites',
    select: mangaCardProjection,
  },
  watchlist: {
    path: 'watchlist',
    select: mangaCardProjection,
  },
};

const applyLibraryPopulation = (query, listName) => {
  const listNames = Array.isArray(listName) ? listName : [listName];

  listNames
    .filter((item) => libraryPopulation[item])
    .forEach((item) => {
      query.populate(libraryPopulation[item]);
    });

  return query;
};

const applySocialPopulation = (query, options = {}) => {
  if (options.populateFollowers) {
    query.populate({
      path: 'followers',
      select: publicUserProjection,
    });
  }

  if (options.populateFollowing) {
    query.populate({
      path: 'following',
      select: publicUserProjection,
    });
  }

  return query;
};

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

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.search) {
    const regex = new RegExp(escapeRegex(filters.search.trim()), 'i');
    query.$or = [{ name: regex }, { username: regex }, { email: regex }];
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
  const query = User.findOne({ email: normalizeEmail(email) });
  const sensitiveProjection = buildSensitiveProjection(options);

  if (sensitiveProjection) {
    query.select(sensitiveProjection);
  }

  return query.exec();
};

const findByUsername = (username, options = {}) => {
  const query = User.findOne({ username: normalizeUsername(username) });
  const sensitiveProjection = buildSensitiveProjection(options);

  if (sensitiveProjection) {
    query.select(sensitiveProjection);
  }

  return query.exec();
};

const findByUsernameWithLibrary = (username, listName, options = {}) => {
  const query = User.findOne({ username: normalizeUsername(username) });
  const sensitiveProjection = buildSensitiveProjection(options);

  if (sensitiveProjection) {
    query.select(sensitiveProjection);
  }

  return applyLibraryPopulation(query, listName).exec();
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
  await User.exists({ email: normalizeEmail(email) }),
);

const existsByUsername = async (username) => Boolean(
  await User.exists({ username: normalizeUsername(username) }),
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

const findByIdWithLibrary = (id, listName, options = {}) => {
  const query = User.findById(id);
  const sensitiveProjection = buildSensitiveProjection(options);

  if (sensitiveProjection) {
    query.select(sensitiveProjection);
  }

  return applyLibraryPopulation(query, listName).exec();
};

const findByIdWithSocial = (id, options = {}) => {
  const query = User.findById(id);
  const sensitiveProjection = buildSensitiveProjection(options);

  if (sensitiveProjection) {
    query.select(sensitiveProjection);
  }

  return applySocialPopulation(query, options).exec();
};

const findByUsernameWithSocial = (username, options = {}) => {
  const query = User.findOne({ username: normalizeUsername(username) });
  const sensitiveProjection = buildSensitiveProjection(options);

  if (sensitiveProjection) {
    query.select(sensitiveProjection);
  }

  return applySocialPopulation(query, options).exec();
};

const addToLibrary = (id, listName, mangaId, options = {}) => {
  const query = User.findByIdAndUpdate(
    id,
    {
      $addToSet: {
        [listName]: mangaId,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  const sensitiveProjection = buildSensitiveProjection(options);
  if (sensitiveProjection) {
    query.select(sensitiveProjection);
  }

  return applyLibraryPopulation(query, listName).exec();
};

const removeFromLibrary = (id, listName, mangaId, options = {}) => {
  const query = User.findByIdAndUpdate(
    id,
    {
      $pull: {
        [listName]: mangaId,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  const sensitiveProjection = buildSensitiveProjection(options);
  if (sensitiveProjection) {
    query.select(sensitiveProjection);
  }

  return applyLibraryPopulation(query, listName).exec();
};

const updatePreferences = (id, preferences, options = {}) => {
  const normalizedPreferences = Object.fromEntries(
    Object.entries(preferences || {}).map(([key, value]) => [`preferences.${key}`, value]),
  );
  const query = User.findByIdAndUpdate(
    id,
    { $set: normalizedPreferences },
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

const isFollowing = async (userId, targetUserId) => Boolean(await User.exists({
  _id: userId,
  following: targetUserId,
}));

const addFollowing = (userId, targetUserId) => User.findByIdAndUpdate(
  userId,
  {
    $addToSet: {
      following: targetUserId,
    },
  },
  {
    new: true,
    runValidators: true,
  },
).exec();

const removeFollowing = (userId, targetUserId) => User.findByIdAndUpdate(
  userId,
  {
    $pull: {
      following: targetUserId,
    },
  },
  {
    new: true,
    runValidators: true,
  },
).exec();

const addFollower = (userId, followerUserId) => User.findByIdAndUpdate(
  userId,
  {
    $addToSet: {
      followers: followerUserId,
    },
  },
  {
    new: true,
    runValidators: true,
  },
).exec();

const removeFollower = (userId, followerUserId) => User.findByIdAndUpdate(
  userId,
  {
    $pull: {
      followers: followerUserId,
    },
  },
  {
    new: true,
    runValidators: true,
  },
).exec();

module.exports = {
  findAll,
  findById,
  findByEmail,
  findByUsername,
  findByUsernameWithLibrary,
  findByVerificationToken,
  existsById,
  existsByEmail,
  existsByUsername,
  countDocuments,
  create,
  updateById,
  markAsVerified,
  deleteById,
  findByIdWithLibrary,
  findByIdWithSocial,
  findByUsernameWithSocial,
  addToLibrary,
  removeFromLibrary,
  updatePreferences,
  isFollowing,
  addFollowing,
  removeFollowing,
  addFollower,
  removeFollower,
};
