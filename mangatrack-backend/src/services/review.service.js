const { isValidObjectId } = require('mongoose');

const mangaRepository = require('../repositories/manga.repository');
const reviewRepository = require('../repositories/review.repository');
const {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} = require('../utils/errors');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
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

const ensureValidObjectId = (value, fieldLabel) => {
  if (!isValidObjectId(value)) {
    throw new BadRequestError(`El ${fieldLabel} no es valido.`);
  }
};

const ensureMangaExists = async (mangaId) => {
  ensureValidObjectId(mangaId, 'id del manga');

  const manga = await mangaRepository.findById(mangaId, {
    populateCreatedBy: false,
  });

  if (!manga) {
    throw new NotFoundError('El manga indicado no existe.');
  }

  return manga;
};

const getReviewOrThrow = async (reviewId, options = { populate: false }) => {
  ensureValidObjectId(reviewId, 'id de la review');

  const review = await reviewRepository.findById(reviewId, options);

  if (!review) {
    throw new NotFoundError('Review no encontrada.');
  }

  return review;
};

const ensureReviewOwner = (review, userId) => {
  if (review.user.toString() !== userId) {
    throw new ForbiddenError('No tienes permisos para modificar esta review.');
  }
};

const pickReviewPayload = (payload = {}) => {
  const reviewPayload = {};

  if (payload.rating !== undefined) {
    reviewPayload.rating = Number(payload.rating);
  }

  if (payload.comment !== undefined) {
    reviewPayload.comment = payload.comment.trim();
  }

  if (payload.status !== undefined) {
    reviewPayload.status = payload.status;
  }

  if (payload.manga !== undefined) {
    reviewPayload.manga = payload.manga;
  }

  return reviewPayload;
};

const getAllReviews = async (query = {}) => {
  const filters = {};
  const { page, limit, skip } = parsePagination(query);

  if (query.status) {
    filters.status = query.status;
  }

  if (query.user) {
    ensureValidObjectId(query.user, 'id del usuario');
    filters.user = query.user;
  }

  if (query.manga) {
    ensureValidObjectId(query.manga, 'id del manga');
    filters.manga = query.manga;
  }

  const [items, total] = await Promise.all([
    reviewRepository.findAll(filters, { skip, limit }),
    reviewRepository.countDocuments(filters),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

const getReviewById = async (reviewId) => getReviewOrThrow(reviewId);

const getMyReviews = async (userId, query = {}) => {
  const filters = {};
  const { page, limit, skip } = parsePagination(query);

  if (query.status) {
    filters.status = query.status;
  }

  const [items, total] = await Promise.all([
    reviewRepository.findByUserId(userId, filters, { skip, limit }),
    reviewRepository.countDocuments({ ...filters, user: userId }),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

const createReview = async (payload, userId) => {
  await ensureMangaExists(payload.manga);

  const existingReview = await reviewRepository.findByUserAndManga(userId, payload.manga, {
    populate: false,
  });

  if (existingReview) {
    throw new ConflictError('Ya tienes una review creada para este manga.');
  }

  return reviewRepository.create({
    rating: Number(payload.rating),
    comment: payload.comment.trim(),
    status: payload.status,
    user: userId,
    manga: payload.manga,
  });
};

const updateReview = async (reviewId, payload, userId) => {
  const existingReview = await getReviewOrThrow(reviewId, { populate: false });
  ensureReviewOwner(existingReview, userId);

  const reviewPayload = pickReviewPayload(payload);

  if (Object.keys(reviewPayload).length === 0) {
    throw new BadRequestError('Debes enviar al menos un campo para actualizar la review.');
  }

  if (reviewPayload.manga !== undefined) {
    await ensureMangaExists(reviewPayload.manga);

    const duplicatedReview = await reviewRepository.findByUserAndManga(userId, reviewPayload.manga, {
      populate: false,
    });

    if (duplicatedReview && duplicatedReview._id.toString() !== existingReview._id.toString()) {
      throw new ConflictError('Ya tienes una review creada para ese manga.');
    }
  }

  return reviewRepository.updateById(reviewId, reviewPayload);
};

const deleteReview = async (reviewId, userId) => {
  const existingReview = await getReviewOrThrow(reviewId, { populate: false });
  ensureReviewOwner(existingReview, userId);

  await reviewRepository.deleteById(reviewId);

  return existingReview;
};

module.exports = {
  getAllReviews,
  getReviewById,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
};
