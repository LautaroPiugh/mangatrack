const activityRepository = require('../repositories/activity.repository');
const followRepository = require('../repositories/follow.repository');
const userRepository = require('../repositories/user.repository');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const { sanitizePublicUser } = require('../utils/user');

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

const getUserOrThrow = async (username) => {
  const user = await userRepository.findByUsername(username);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado.');
  }

  return user;
};

const recordActivitySafely = async (payload = {}) => {
  if (!payload.user || !payload.type) {
    return null;
  }

  try {
    console.info('[activity] create', {
      user: payload.user.toString(),
      type: payload.type,
      visibility: payload.visibility || 'public',
      manga: payload.manga?.toString?.() || payload.manga || null,
      list: payload.list?.toString?.() || payload.list || null,
      review: payload.review?.toString?.() || payload.review || null,
    });

    return await activityRepository.create(payload);
  } catch (error) {
    console.warn('[activity] create failed', {
      message: error.message,
      type: payload.type,
      user: payload.user?.toString?.() || payload.user || null,
    });
    return null;
  }
};

const FEED_ACTIVITY_TYPES = [
  'review_created',
  'manga_favorited',
  'manga_added_to_watchlist',
];

const getFeed = async (userId, query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const followingIds = await followRepository.findFollowingIdsByFollower(userId);

  if (followingIds.length === 0) {
    return {
      items: [],
      pagination: {
        ...buildPaginationMeta(0, page, limit),
        followingCount: 0,
      },
    };
  }

  const filters = {
    visibility: 'public',
    userIds: followingIds,
    types: FEED_ACTIVITY_TYPES,
  };

  const [items, total] = await Promise.all([
    activityRepository.findAll(filters, { skip, limit }),
    activityRepository.countDocuments(filters),
  ]);

  return {
    items,
    pagination: {
      ...buildPaginationMeta(total, page, limit),
      followingCount: followingIds.length,
    },
  };
};

const getMyActivity = async (userId, query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const filters = {
    user: userId,
  };

  const [items, total] = await Promise.all([
    activityRepository.findAll(filters, { skip, limit }),
    activityRepository.countDocuments(filters),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

const getUserActivity = async (username, currentUser = null, query = {}) => {
  const targetUser = await getUserOrThrow(username);
  const isOwner = currentUser?.id === targetUser._id.toString();
  const { page, limit, skip } = parsePagination(query);
  const filters = {
    user: targetUser._id,
  };

  if (!isOwner) {
    filters.visibility = 'public';
  }

  const [items, total] = await Promise.all([
    activityRepository.findAll(filters, { skip, limit }),
    activityRepository.countDocuments(filters),
  ]);

  return {
    user: sanitizePublicUser(targetUser),
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

const validateActivityPayload = (payload = {}) => {
  if (!payload.user) {
    throw new BadRequestError('La actividad requiere un usuario.');
  }

  if (!payload.type) {
    throw new BadRequestError('La actividad requiere un tipo.');
  }
};

const createActivity = async (payload = {}) => {
  validateActivityPayload(payload);
  return activityRepository.create(payload);
};

module.exports = {
  createActivity,
  recordActivitySafely,
  getFeed,
  getMyActivity,
  getUserActivity,
};
