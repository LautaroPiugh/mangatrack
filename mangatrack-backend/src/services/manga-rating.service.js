const mangaRepository = require('../repositories/manga.repository');
const reviewRepository = require('../repositories/review.repository');

const recalculateMangaRating = async (mangaId) => {
  const summary = await reviewRepository.getAverageRatingByMangaId(mangaId);

  await mangaRepository.updateRatingSummary(mangaId, {
    averageRating: summary.averageRating,
    ratingsCount: summary.totalReviews,
  });

  return summary;
};

module.exports = {
  recalculateMangaRating,
};
