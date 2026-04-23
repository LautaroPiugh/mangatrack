const mongoose = require('mongoose');

const Review = require('../models/Review');

const reviewPopulation = [
  {
    path: 'user',
    select: 'name email isVerified',
  },
  {
    path: 'manga',
    select: 'title author genre coverImage',
  },
];

const buildReviewFilters = (filters = {}) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.user) {
    query.user = filters.user;
  }

  if (filters.manga) {
    query.manga = filters.manga;
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

module.exports = {
  findAll,
  findById,
  findByUserId,
  findByMangaId,
  findByUserAndManga,
  existsById,
  countDocuments,
  create,
  updateById,
  deleteById,
  deleteManyByMangaId,
  getAverageRatingByMangaId,
};
