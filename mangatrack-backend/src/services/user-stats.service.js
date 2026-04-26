const reviewRepository = require('../repositories/review.repository');

const TOP_GENRES_LIMIT = 4;

const buildUserStats = async (user, { topGenresLimit = TOP_GENRES_LIMIT } = {}) => {
  const userId = user?._id || user?.id;

  if (!userId) {
    return {
      reviewsCount: 0,
      favoritesCount: 0,
      watchlistCount: 0,
      averageRatingGiven: 0,
      topGenres: [],
    };
  }

  const [reviewSummary, topGenres] = await Promise.all([
    reviewRepository.getUserRatingSummary(userId),
    reviewRepository.getTopGenresByUserId(userId, topGenresLimit),
  ]);

  return {
    reviewsCount: reviewSummary.reviewsCount,
    favoritesCount: user.favorites?.length || 0,
    watchlistCount: user.watchlist?.length || 0,
    averageRatingGiven: reviewSummary.averageRatingGiven,
    topGenres,
  };
};

module.exports = {
  buildUserStats,
};
