const activityRepository = require('../repositories/activity.repository');
const followRepository = require('../repositories/follow.repository');
const listRepository = require('../repositories/list.repository');
const reviewRepository = require('../repositories/review.repository');
const userRepository = require('../repositories/user.repository');
const { buildUserStats } = require('./user-stats.service');
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
} = require('../utils/errors');
const {
  normalizeOptionalString,
  normalizeUsername,
  sanitizePublicUser,
  sanitizeUser,
} = require('../utils/user');

const PUBLIC_PROFILE_FAVORITES_LIMIT = 8;
const PUBLIC_PROFILE_REVIEWS_LIMIT = 4;
const PUBLIC_PROFILE_LISTS_LIMIT = 4;
const PUBLIC_PROFILE_ACTIVITY_LIMIT = 8;

const getUserByIdOrThrow = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado.');
  }

  return user;
};

const getUserByUsernameOrThrow = async (username) => {
  const user = await userRepository.findByUsername(username);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado.');
  }

  return user;
};

const buildProfilePayload = async (user, currentUser = null) => {
  const isCurrentUser = currentUser?.id === user._id.toString();
  const [stats, recentReviews, publicLists, activity, isFollowing, followersCount, followingCount] = await Promise.all([
    buildUserStats(user),
    reviewRepository.findByUserId(user._id, { isPublic: true }, {
      limit: PUBLIC_PROFILE_REVIEWS_LIMIT,
      sort: { createdAt: -1 },
    }),
    listRepository.findByOwnerId(user._id, { visibility: 'public' }, {
      limit: PUBLIC_PROFILE_LISTS_LIMIT,
      sort: { updatedAt: -1 },
    }),
    activityRepository.findAll({
      user: user._id,
      visibility: 'public',
    }, {
      limit: PUBLIC_PROFILE_ACTIVITY_LIMIT,
      sort: { createdAt: -1 },
    }),
    currentUser?.id && !isCurrentUser
      ? followRepository.exists({
        follower: currentUser.id,
        following: user._id,
      })
      : Promise.resolve(false),
    followRepository.countDocuments({ following: user._id }),
    followRepository.countDocuments({ follower: user._id }),
  ]);

  return {
    ...sanitizePublicUser(user),
    stats,
    followersCount,
    followingCount,
    isFollowing,
    isCurrentUser,
    favorites: (user.favorites || []).slice(0, PUBLIC_PROFILE_FAVORITES_LIMIT),
    recentReviews,
    lists: publicLists,
    activity,
  };
};

const getPublicProfile = async (username, currentUser = null) => {
  const user = await userRepository.findByUsernameWithLibrary(username, ['favorites', 'watchlist']);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado.');
  }

  return buildProfilePayload(user, currentUser);
};

const getPublicProfileById = async (userId, currentUser = null) => {
  const user = await userRepository.findByIdWithLibrary(userId, ['favorites', 'watchlist']);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado.');
  }

  return buildProfilePayload(user, currentUser);
};

const updateMyProfile = async (userId, payload = {}) => {
  const existingUser = await getUserByIdOrThrow(userId);
  const updatePayload = {};
  const preferencesPayload = {};

  if (payload.username !== undefined) {
    const normalizedUsername = normalizeUsername(payload.username);

    if (normalizedUsername !== existingUser.username) {
      const usernameInUse = await userRepository.existsByUsername(normalizedUsername);

      if (usernameInUse) {
        throw new ConflictError('Ya existe un usuario registrado con ese username.');
      }
    }

    updatePayload.username = normalizedUsername;
  }

  if (payload.displayName !== undefined) {
    updatePayload.displayName = normalizeOptionalString(payload.displayName);
  }

  if (payload.avatar !== undefined) {
    updatePayload.avatar = normalizeOptionalString(payload.avatar);
  }

  if (payload.bio !== undefined) {
    updatePayload.bio = normalizeOptionalString(payload.bio);
  }

  if (payload.theme !== undefined) {
    preferencesPayload.theme = payload.theme;
  }

  if (payload.preferredLanguage !== undefined) {
    preferencesPayload.language = payload.preferredLanguage;
  }

  if (Object.keys(updatePayload).length === 0 && Object.keys(preferencesPayload).length === 0) {
    throw new BadRequestError('Debes enviar al menos un campo para actualizar tu perfil.');
  }

  if (Object.keys(updatePayload).length > 0) {
    await userRepository.updateById(userId, updatePayload);
  }

  if (Object.keys(preferencesPayload).length > 0) {
    await userRepository.updatePreferences(userId, preferencesPayload);
  }

  const updatedUser = await getUserByIdOrThrow(userId);
  return sanitizeUser(updatedUser);
};

const buildFollowResponse = (user, isFollowing) => ({
  user: sanitizePublicUser(user),
  followersCount: 0,
  followingCount: 0,
  isFollowing,
});

const finalizeFollowResponse = async (user, isFollowing) => ({
  ...buildFollowResponse(user, isFollowing),
  followersCount: await followRepository.countDocuments({ following: user._id }),
  followingCount: await followRepository.countDocuments({ follower: user._id }),
});

const followUser = async (userId, targetUserId) => {
  const [currentUser, targetUser] = await Promise.all([
    getUserByIdOrThrow(userId),
    getUserByIdOrThrow(targetUserId),
  ]);

  if (currentUser._id.toString() === targetUser._id.toString()) {
    throw new BadRequestError('No puedes seguirte a ti mismo.');
  }

  const alreadyFollowing = await followRepository.exists({
    follower: currentUser._id,
    following: targetUser._id,
  });

  if (!alreadyFollowing) {
    await followRepository.create({
      follower: currentUser._id,
      following: targetUser._id,
    });
  }

  return finalizeFollowResponse(targetUser, true);
};

const unfollowUser = async (userId, targetUserId) => {
  const [currentUser, targetUser] = await Promise.all([
    getUserByIdOrThrow(userId),
    getUserByIdOrThrow(targetUserId),
  ]);

  if (currentUser._id.toString() === targetUser._id.toString()) {
    throw new BadRequestError('No puedes dejar de seguirte a ti mismo.');
  }

  const alreadyFollowing = await followRepository.exists({
    follower: currentUser._id,
    following: targetUser._id,
  });

  if (alreadyFollowing) {
    await followRepository.deleteOne({
      follower: currentUser._id,
      following: targetUser._id,
    });
  }

  return finalizeFollowResponse(targetUser, false);
};

const getFollowers = async (userId) => {
  const [user, follows] = await Promise.all([
    getUserByIdOrThrow(userId),
    followRepository.findFollowersByUserId(userId),
  ]);

  return {
    user: sanitizePublicUser(user),
    items: follows
      .map((item) => item.follower)
      .filter(Boolean)
      .map(sanitizePublicUser),
  };
};

const getFollowing = async (userId) => {
  const [user, follows] = await Promise.all([
    getUserByIdOrThrow(userId),
    followRepository.findFollowingByUserId(userId),
  ]);

  return {
    user: sanitizePublicUser(user),
    items: follows
      .map((item) => item.following)
      .filter(Boolean)
      .map(sanitizePublicUser),
  };
};

module.exports = {
  getPublicProfile,
  getPublicProfileById,
  updateMyProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
