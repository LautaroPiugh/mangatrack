const mongoose = require('mongoose');

const Review = require('../models/Review');

const reviewPopulation = [
  {
    path: 'user',
    select: 'name username displayName avatar bio createdAt',
  },
  {
    path: 'manga',
    select: 'title slug author artist genres coverUrl status averageRating ratingsCount',
  },
];

const buildReviewFilters = (filters = {}) => {
  const query = {};

  if (filters.user) {
    query.user = filters.user;
  }

  if (filters.manga) {
    query.manga = filters.manga;
  }

  if (typeof filters.isPublic === 'boolean') {
    query.isPublic = filters.isPublic;
  }

  return query;
};

const applyReviewOptions = (query, options = {}) => {
  if (options.populate !== false) {
    reviewPopulation.forEach((populationItem) => {
      query.populate(populationItem);
    });
  }

  if (typeof query.sort === 'function') {
    query.sort(options.sort || { createdAt: -1 });
  }

  if (typeof query.skip === 'function' && Number.isInteger(options.skip) && options.skip >= 0) {
    query.skip(options.skip);
  }

  if (typeof query.limit === 'function' && Number.isInteger(options.limit) && options.limit > 0) {
    query.limit(options.limit);
  }

  return query;
};

const findAll = (filters = {}, options = {}) => {
  const query = Review.find(buildReviewFilters(filters));
  applyReviewOptions(query, options);
  return query.exec();
};

const findById = (id, options = {}) => {
  const query = Review.findById(id);
  applyReviewOptions(query, options);
  return query.exec();
};

const findByUserId = (userId, filters = {}, options = {}) => {
  const query = Review.find(buildReviewFilters({ ...filters, user: userId }));
  applyReviewOptions(query, options);
  return query.exec();
};

const findByMangaId = (mangaId, filters = {}, options = {}) => {
  const query = Review.find(buildReviewFilters({ ...filters, manga: mangaId }));
  applyReviewOptions(query, options);
  return query.exec();
};

const findByUserAndManga = (userId, mangaId, options = {}) => {
  const query = Review.findOne({ user: userId, manga: mangaId });
  applyReviewOptions(query, options);
  return query.exec();
};

const existsById = async (id) => Boolean(await Review.exists({ _id: id }));

const countDocuments = (filters = {}) => Review.countDocuments(buildReviewFilters(filters));

const findRecentPublic = (limit = 4) => {
  const query = Review.find({ isPublic: true });
  applyReviewOptions(query, {
    limit,
    sort: { createdAt: -1 },
  });
  return query.exec();
};

const create = async (reviewData, options = {}) => {
  const createdReview = await Review.create(reviewData);

  if (options.populate === false) {
    return createdReview;
  }

  return findById(createdReview._id, options);
};

const updateById = (id, updateData, options = {}) => {
  const query = Review.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  applyReviewOptions(query, options);
  return query.exec();
};

const deleteById = (id) => Review.findByIdAndDelete(id).exec();

const deleteManyByMangaId = (mangaId) => Review.deleteMany({ manga: mangaId }).exec();

const getAverageRatingByMangaId = async (mangaId) => {
  const [result] = await Review.aggregate([
    {
      $match: {
        manga: new mongoose.Types.ObjectId(mangaId),
      },
    },
    {
      $group: {
        _id: '$manga',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (!result) {
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }

  return {
    averageRating: Number(result.averageRating.toFixed(1)),
    totalReviews: result.totalReviews,
  };
};

const getUserRatingSummary = async (userId) => {
  const [result] = await Review.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: '$user',
        reviewsCount: { $sum: 1 },
        averageRatingGiven: { $avg: '$rating' },
      },
    },
  ]);

  if (!result) {
    return {
      reviewsCount: 0,
      averageRatingGiven: 0,
    };
  }

  return {
    reviewsCount: result.reviewsCount,
    averageRatingGiven: Number(result.averageRatingGiven.toFixed(1)),
  };
};

const getTopGenresByUserId = async (userId, limit = 3) => Review.aggregate([
  {
    $match: {
      user: new mongoose.Types.ObjectId(userId),
    },
  },
  {
    $lookup: {
      from: 'mangas',
      localField: 'manga',
      foreignField: '_id',
      as: 'manga',
    },
  },
  {
    $unwind: '$manga',
  },
  {
    $unwind: '$manga.genres',
  },
  {
    $group: {
      _id: '$manga.genres',
      count: { $sum: 1 },
    },
  },
  {
    $sort: {
      count: -1,
      _id: 1,
    },
  },
  {
    $limit: limit,
  },
  {
    $project: {
      _id: 0,
      genre: '$_id',
      count: 1,
    },
  },
]);

module.exports = {
  findAll,
  findById,
  findByUserId,
  findByMangaId,
  findByUserAndManga,
  existsById,
  countDocuments,
  findRecentPublic,
  create,
  updateById,
  deleteById,
  deleteManyByMangaId,
  getAverageRatingByMangaId,
  getUserRatingSummary,
  getTopGenresByUserId,
};
