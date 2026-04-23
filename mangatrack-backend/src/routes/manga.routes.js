const express = require('express');
const { body, param, query } = require('express-validator');

const mangaController = require('../controllers/manga.controller');
const requireAuth = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');

const router = express.Router();

const listMangaValidations = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 }).withMessage('La busqueda debe tener entre 1 y 120 caracteres.'),
  query('genre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('El genero debe tener entre 2 y 50 caracteres.'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La pagina debe ser un entero mayor o igual a 1.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('El limite debe ser un entero entre 1 y 50.')
    .toInt(),
];

const mangaIdValidation = [
  param('id')
    .isMongoId().withMessage('El id del manga no es valido.'),
];

const createMangaValidations = [
  body('title')
    .trim()
    .notEmpty().withMessage('El titulo es obligatorio.')
    .bail()
    .isLength({ min: 2, max: 120 }).withMessage('El titulo debe tener entre 2 y 120 caracteres.'),
  body('author')
    .trim()
    .notEmpty().withMessage('El autor es obligatorio.')
    .bail()
    .isLength({ min: 2, max: 80 }).withMessage('El autor debe tener entre 2 y 80 caracteres.'),
  body('genre')
    .trim()
    .notEmpty().withMessage('El genero es obligatorio.')
    .bail()
    .isLength({ min: 2, max: 50 }).withMessage('El genero debe tener entre 2 y 50 caracteres.'),
  body('description')
    .trim()
    .notEmpty().withMessage('La descripcion es obligatoria.')
    .bail()
    .isLength({ min: 20, max: 2000 }).withMessage('La descripcion debe tener entre 20 y 2000 caracteres.'),
  body('coverImage')
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ require_protocol: true }).withMessage('La portada debe ser una URL valida.'),
];

const updateMangaValidations = [
  ...mangaIdValidation,
  body()
    .custom((value, { req }) => (
      ['title', 'author', 'genre', 'description', 'coverImage']
        .some((field) => req.body[field] !== undefined)
    ))
    .withMessage('Debes enviar al menos un campo para actualizar el manga.'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage('El titulo debe tener entre 2 y 120 caracteres.'),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage('El autor debe tener entre 2 y 80 caracteres.'),
  body('genre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('El genero debe tener entre 2 y 50 caracteres.'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 }).withMessage('La descripcion debe tener entre 20 y 2000 caracteres.'),
  body('coverImage')
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ require_protocol: true }).withMessage('La portada debe ser una URL valida.'),
];

const mangaReviewsValidations = [
  ...mangaIdValidation,
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

router.get('/', listMangaValidations, validateRequest, mangaController.getAllMangas);
router.get('/:id/reviews', mangaReviewsValidations, validateRequest, mangaController.getMangaReviews);
router.get('/:id', mangaIdValidation, validateRequest, mangaController.getMangaById);
router.post('/', requireAuth, createMangaValidations, validateRequest, mangaController.createManga);
router.put('/:id', requireAuth, updateMangaValidations, validateRequest, mangaController.updateManga);
router.delete('/:id', requireAuth, mangaIdValidation, validateRequest, mangaController.deleteManga);

module.exports = router;
