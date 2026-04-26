const { isValidObjectId } = require('mongoose');

const mangaRepository = require('../repositories/manga.repository');
const reviewRepository = require('../repositories/review.repository');
const { recordActivitySafely } = require('./activity.service');
const { recalculateMangaRating } = require('./manga-rating.service');
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../utils/errors');
const { normalizeOptionalString } = require('../utils/user');

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

const ensureReviewAccess = (review, currentUser) => {
  if (currentUser?.role === 'admin') {
    return;
  }

  if (review.user.toString() !== currentUser?.id) {
    throw new ForbiddenError('No tienes permisos para modificar esta review.');
  }
};

const syncMangaRatingSummary = async (...mangaIds) => Promise.all(
  [...new Set(mangaIds.filter(Boolean).map((mangaId) => mangaId.toString()))]
    .map((mangaId) => recalculateMangaRating(mangaId)),
);

const pickReviewPayload = (payload = {}) => {
  const reviewPayload = {};

  if (payload.rating !== undefined) {
    reviewPayload.rating = Number(payload.rating);
  }

  if (payload.content !== undefined) {
    reviewPayload.content = normalizeOptionalString(payload.content);
  }

  if (payload.isPublic !== undefined) {
    reviewPayload.isPublic = Boolean(payload.isPublic);
  }

  if (payload.mangaId !== undefined) {
    reviewPayload.manga = payload.mangaId;
  } else if (payload.manga !== undefined) {
    reviewPayload.manga = payload.manga;
  }

  return reviewPayload;
};

const getAllReviews = async (query = {}) => {
  const filters = {
    isPublic: true,
  };
  const { page, limit, skip } = parsePagination(query);

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

const getReviewById = async (reviewId) => {
  const review = await getReviewOrThrow(reviewId);

  if (!review.isPublic) {
    throw new NotFoundError('Review no encontrada.');
  }

  return review;
};

const getRecentReviews = async (query = {}) => {
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 4, 1), 12);
  return reviewRepository.findRecentPublic(limit);
};

const getMyReviews = async (userId, query = {}) => {
  const filters = {
    user: userId,
  };
  const { page, limit, skip } = parsePagination(query);

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

const createReview = async (payload, currentUser) => {
  const reviewPayload = pickReviewPayload(payload);

  if (!reviewPayload.manga) {
    throw new BadRequestError('El manga es obligatorio.');
  }

  await ensureMangaExists(reviewPayload.manga);

  const existingReview = await reviewRepository.findByUserAndManga(currentUser.id, reviewPayload.manga, {
    populate: false,
  });

  if (existingReview) {
    const updatedReview = await reviewRepository.updateById(existingReview._id, {
      rating: reviewPayload.rating,
      content: reviewPayload.content ?? null,
      isPublic: reviewPayload.isPublic ?? existingReview.isPublic,
    });

    await syncMangaRatingSummary(reviewPayload.manga);

    return {
      created: false,
      review: updatedReview,
    };
  }

  const review = await reviewRepository.create({
    rating: reviewPayload.rating,
    content: reviewPayload.content ?? null,
    isPublic: reviewPayload.isPublic ?? true,
    user: currentUser.id,
    manga: reviewPayload.manga,
  });

  await syncMangaRatingSummary(reviewPayload.manga);
  if (review.isPublic !== false) {
    await recordActivitySafely({
      user: currentUser.id,
      type: 'review_created',
      manga: reviewPayload.manga,
      review: review._id,
      visibility: 'public',
      metadata: {
        rating: review.rating,
      },
    });
  }

  return {
    created: true,
    review,
  };
};

const updateReview = async (reviewId, payload, currentUser) => {
  const existingReview = await getReviewOrThrow(reviewId, { populate: false });
  ensureReviewAccess(existingReview, currentUser);

  const reviewPayload = pickReviewPayload(payload);

  if (Object.keys(reviewPayload).length === 0) {
    throw new BadRequestError('Debes enviar al menos un campo para actualizar la review.');
  }

  const updatedReview = await reviewRepository.updateById(reviewId, reviewPayload);

  await syncMangaRatingSummary(existingReview.manga);

  return updatedReview;
};

const deleteReview = async (reviewId, currentUser) => {
  const existingReview = await getReviewOrThrow(reviewId, { populate: false });
  ensureReviewAccess(existingReview, currentUser);

  await reviewRepository.deleteById(reviewId);
  await syncMangaRatingSummary(existingReview.manga);

  return existingReview;
};

module.exports = {
  getAllReviews,
  getReviewById,
  getRecentReviews,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
};
