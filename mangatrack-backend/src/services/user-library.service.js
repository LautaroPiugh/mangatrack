const mangaRepository = require('../repositories/manga.repository');
const reviewRepository = require('../repositories/review.repository');
const userRepository = require('../repositories/user.repository');
const { NotFoundError } = require('../utils/errors');
const { sanitizeUser } = require('../utils/user');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const TOP_GENRES_LIMIT = 3;

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

const paginateItems = (items = [], page, limit) => {
  const safeItems = Array.isArray(items) ? items : [];
  const startIndex = (page - 1) * limit;

  return {
    items: safeItems.slice(startIndex, startIndex + limit),
    pagination: buildPaginationMeta(safeItems.length, page, limit),
  };
};

const ensureMangaExists = async (mangaId) => {
  const manga = await mangaRepository.findById(mangaId, { populateCreatedBy: false });

  if (!manga) {
    throw new NotFoundError('Manga no encontrado.');
  }
};

const getUserOrThrow = async (userId, options = {}) => {
  const user = options.library
    ? await userRepository.findByIdWithLibrary(userId, options.library)
    : await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado.');
  }

  return user;
};

const buildUserStats = async (user) => {
  const [reviewSummary, topGenres] = await Promise.all([
    reviewRepository.getUserRatingSummary(user._id || user.id),
    reviewRepository.getTopGenresByUserId(user._id || user.id, TOP_GENRES_LIMIT),
  ]);

  return {
    reviewsCount: reviewSummary.reviewsCount,
    favoritesCount: user.favorites?.length || 0,
    watchlistCount: user.watchlist?.length || 0,
    averageRatingGiven: reviewSummary.averageRatingGiven,
    topGenres,
  };
};

const getLibraryItems = async (userId, listName) => {
  const user = await getUserOrThrow(userId, { library: listName });
  return user[listName] || [];
};

const updateLibraryItems = async (userId, listName, operation, mangaId) => {
  await ensureMangaExists(mangaId);

  const user = operation === 'add'
    ? await userRepository.addToLibrary(userId, listName, mangaId)
    : await userRepository.removeFromLibrary(userId, listName, mangaId);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado.');
  }

  return user[listName] || [];
};

const getMyProfile = async (userId) => {
  const user = await getUserOrThrow(userId);
  const stats = await buildUserStats(user);

  return {
    ...sanitizeUser(user),
    createdAt: user.createdAt,
    stats,
  };
};

const getMyLibrary = async (userId, query = {}) => {
  const section = query.section || '';
  const { page, limit, skip } = parsePagination(query);
  const user = await getUserOrThrow(userId, { library: ['favorites', 'watchlist'] });
  const stats = await buildUserStats(user);

  const result = {
    favorites: [],
    watchlist: [],
    reviews: [],
    stats,
  };

  let pagination = null;

  if (!section || section === 'favorites') {
    if (section === 'favorites') {
      const paginatedFavorites = paginateItems(user.favorites || [], page, limit);
      result.favorites = paginatedFavorites.items;
      pagination = paginatedFavorites.pagination;
    } else {
      result.favorites = user.favorites || [];
    }
  }

  if (!section || section === 'watchlist') {
    if (section === 'watchlist') {
      const paginatedWatchlist = paginateItems(user.watchlist || [], page, limit);
      result.watchlist = paginatedWatchlist.items;
      pagination = paginatedWatchlist.pagination;
    } else {
      result.watchlist = user.watchlist || [];
    }
  }

  if (!section || section === 'reviews') {
    const [reviews, totalReviews] = await Promise.all([
      reviewRepository.findByUserId(userId, {}, { skip, limit }),
      reviewRepository.countDocuments({ user: userId }),
    ]);

    result.reviews = reviews;
    pagination = buildPaginationMeta(totalReviews, page, limit);
  }

  return {
    ...result,
    meta: pagination,
  };
};

const getFavorites = async (userId) => getLibraryItems(userId, 'favorites');
const addFavorite = async (userId, mangaId) => updateLibraryItems(userId, 'favorites', 'add', mangaId);
const removeFavorite = async (userId, mangaId) => updateLibraryItems(userId, 'favorites', 'remove', mangaId);

const getWatchlist = async (userId) => getLibraryItems(userId, 'watchlist');
const addToWatchlist = async (userId, mangaId) => updateLibraryItems(userId, 'watchlist', 'add', mangaId);
const removeFromWatchlist = async (userId, mangaId) => updateLibraryItems(userId, 'watchlist', 'remove', mangaId);

const updatePreferences = async (userId, preferences) => {
  const user = await userRepository.updatePreferences(userId, preferences);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado.');
  }

  return user.preferences;
};

module.exports = {
  getMyProfile,
  getMyLibrary,
  getFavorites,
  addFavorite,
  removeFavorite,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updatePreferences,
};
