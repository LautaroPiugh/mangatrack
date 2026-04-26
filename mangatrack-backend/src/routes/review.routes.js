const express = require('express');
const { body, param, query } = require('express-validator');

const reviewController = require('../controllers/review.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');

const router = express.Router();
const isHalfStep = (value) => Number.isInteger(Number(value) * 2);

const reviewIdValidation = [
  param('id')
    .isMongoId().withMessage('El id de la review no es valido.'),
];

const listReviewValidations = [
  query('user')
    .optional()
    .isMongoId().withMessage('El id del usuario no es valido.'),
  query('manga')
    .optional()
    .isMongoId().withMessage('El id del manga no es valido.'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La pagina debe ser un entero mayor o igual a 1.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('El limite debe ser un entero entre 1 y 50.')
    .toInt(),
];

const recentReviewValidations = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('El limite debe ser un entero entre 1 y 12.')
    .toInt(),
];

const myReviewValidations = [
  query('manga')
    .optional()
    .isMongoId().withMessage('El id del manga no es valido.'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La pagina debe ser un entero mayor o igual a 1.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('El limite debe ser un entero entre 1 y 50.')
    .toInt(),
];

const createReviewValidations = [
  body('mangaId')
    .notEmpty().withMessage('El manga es obligatorio.')
    .bail()
    .isMongoId().withMessage('El id del manga no es valido.'),
  body('rating')
    .notEmpty().withMessage('La puntuacion es obligatoria.')
    .bail()
    .isFloat({ min: 0.5, max: 5 }).withMessage('La puntuacion debe estar entre 0.5 y 5.')
    .bail()
    .custom(isHalfStep).withMessage('La puntuacion debe ser multiplo de 0.5.')
    .toFloat(),
  body('content')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 }).withMessage('El contenido no puede superar los 1000 caracteres.'),
  body('isPublic')
    .optional()
    .isBoolean().withMessage('isPublic debe ser true o false.')
    .toBoolean(),
];

const updateReviewValidations = [
  ...reviewIdValidation,
  body()
    .custom((value, { req }) => (
      ['rating', 'content', 'isPublic']
        .some((field) => req.body[field] !== undefined)
    ))
    .withMessage('Debes enviar al menos un campo para actualizar la review.'),
  body('rating')
    .optional()
    .isFloat({ min: 0.5, max: 5 }).withMessage('La puntuacion debe estar entre 0.5 y 5.')
    .bail()
    .custom(isHalfStep).withMessage('La puntuacion debe ser multiplo de 0.5.')
    .toFloat(),
  body('content')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 }).withMessage('El contenido no puede superar los 1000 caracteres.'),
  body('isPublic')
    .optional()
    .isBoolean().withMessage('isPublic debe ser true o false.')
    .toBoolean(),
];

router.get('/', listReviewValidations, validateRequest, reviewController.getAllReviews);
router.get('/recent', recentReviewValidations, validateRequest, reviewController.getRecentReviews);
router.get('/me', authMiddleware, myReviewValidations, validateRequest, reviewController.getMyReviews);
router.get('/:id', reviewIdValidation, validateRequest, reviewController.getReviewById);
router.post('/', authMiddleware, createReviewValidations, validateRequest, reviewController.createReview);
router.put('/:id', authMiddleware, updateReviewValidations, validateRequest, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewIdValidation, validateRequest, reviewController.deleteReview);

module.exports = router;
