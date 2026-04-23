const express = require('express');
const { body, param, query } = require('express-validator');

const reviewController = require('../controllers/review.controller');
const requireAuth = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');

const router = express.Router();

const reviewIdValidation = [
  param('id')
    .isMongoId().withMessage('El id de la review no es valido.'),
];

const listReviewValidations = [
  query('status')
    .optional()
    .isIn(['reading', 'completed', 'planned']).withMessage('El estado debe ser reading, completed o planned.'),
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

const myReviewValidations = [
  query('status')
    .optional()
    .isIn(['reading', 'completed', 'planned']).withMessage('El estado debe ser reading, completed o planned.'),
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
  body('rating')
    .notEmpty().withMessage('La puntuacion es obligatoria.')
    .bail()
    .isInt({ min: 1, max: 5 }).withMessage('La puntuacion debe ser un entero entre 1 y 5.')
    .toInt(),
  body('comment')
    .trim()
    .notEmpty().withMessage('El comentario es obligatorio.')
    .bail()
    .isLength({ min: 5, max: 1200 }).withMessage('El comentario debe tener entre 5 y 1200 caracteres.'),
  body('status')
    .notEmpty().withMessage('El estado es obligatorio.')
    .bail()
    .isIn(['reading', 'completed', 'planned']).withMessage('El estado debe ser reading, completed o planned.'),
  body('manga')
    .notEmpty().withMessage('El manga es obligatorio.')
    .bail()
    .isMongoId().withMessage('El id del manga no es valido.'),
];

const updateReviewValidations = [
  ...reviewIdValidation,
  body()
    .custom((value, { req }) => (
      ['rating', 'comment', 'status', 'manga']
        .some((field) => req.body[field] !== undefined)
    ))
    .withMessage('Debes enviar al menos un campo para actualizar la review.'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('La puntuacion debe ser un entero entre 1 y 5.')
    .toInt(),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 5, max: 1200 }).withMessage('El comentario debe tener entre 5 y 1200 caracteres.'),
  body('status')
    .optional()
    .isIn(['reading', 'completed', 'planned']).withMessage('El estado debe ser reading, completed o planned.'),
  body('manga')
    .optional()
    .isMongoId().withMessage('El id del manga no es valido.'),
];

router.get('/', listReviewValidations, validateRequest, reviewController.getAllReviews);
router.get('/me', requireAuth, myReviewValidations, validateRequest, reviewController.getMyReviews);
router.get('/:id', reviewIdValidation, validateRequest, reviewController.getReviewById);
router.post('/', requireAuth, createReviewValidations, validateRequest, reviewController.createReview);
router.put('/:id', requireAuth, updateReviewValidations, validateRequest, reviewController.updateReview);
router.delete('/:id', requireAuth, reviewIdValidation, validateRequest, reviewController.deleteReview);

module.exports = router;
