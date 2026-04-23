const reviewService = require('../services/review.service');

const getAllReviews = async (req, res) => {
  const result = await reviewService.getAllReviews(req.query);

  res.status(200).json({
    success: true,
    message: 'Reviews obtenidas correctamente.',
    data: result.items,
    meta: result.pagination,
  });
};

const getReviewById = async (req, res) => {
  const review = await reviewService.getReviewById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Review obtenida correctamente.',
    data: review,
  });
};

const getMyReviews = async (req, res) => {
  const result = await reviewService.getMyReviews(req.user.id, req.query);

  res.status(200).json({
    success: true,
    message: 'Tus reviews fueron obtenidas correctamente.',
    data: result.items,
    meta: result.pagination,
  });
};

const createReview = async (req, res) => {
  const review = await reviewService.createReview(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Review creada correctamente.',
    data: review,
  });
};

const updateReview = async (req, res) => {
  const review = await reviewService.updateReview(req.params.id, req.body, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Review actualizada correctamente.',
    data: review,
  });
};

const deleteReview = async (req, res) => {
  const review = await reviewService.deleteReview(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Review eliminada correctamente.',
    data: review,
  });
};

module.exports = {
  getAllReviews,
  getReviewById,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
};
