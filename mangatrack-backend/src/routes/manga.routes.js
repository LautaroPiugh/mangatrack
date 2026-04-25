const express = require('express');
const { body, param, query } = require('express-validator');

const mangaController = require('../controllers/manga.controller');
const externalMangaController = require('../controllers/externalManga.controller');
const { authMiddleware, optionalAuthMiddleware, requireRole } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const {
  MANGA_SORT_OPTIONS,
  MANGA_STATUSES,
  EXTERNAL_MANGA_SOURCES,
  EXTERNAL_MANGA_STATUSES,
  EXTERNAL_MANGA_TYPES,
  EXTERNAL_MANGA_ORDER_BY,
  SLUG_REGEX,
} = require('../utils/manga');

const router = express.Router();

const listMangaValidations = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 }).withMessage('La busqueda debe tener entre 1 y 120 caracteres.'),
  query('genre')
    .optional()
    .trim()
    .isLength({ min: 1, max: 60 }).withMessage('El genero debe tener entre 1 y 60 caracteres.'),
  query('status')
    .optional()
    .isIn(MANGA_STATUSES).withMessage(`El estado debe ser ${MANGA_STATUSES.join(', ')}.`),
  query('sort')
    .optional()
    .isIn(MANGA_SORT_OPTIONS).withMessage(`El orden debe ser ${MANGA_SORT_OPTIONS.join(', ')}.`),
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

const mangaIdOrSlugValidation = [
  param('idOrSlug')
    .trim()
    .notEmpty().withMessage('Debes indicar el id o slug del manga.'),
];

const createMangaValidations = [
  body('title')
    .trim()
    .notEmpty().withMessage('El titulo es obligatorio.')
    .bail()
    .isLength({ min: 2, max: 120 }).withMessage('El titulo debe tener entre 2 y 120 caracteres.'),
  body('slug')
    .optional({ values: 'falsy' })
    .trim()
    .customSanitizer((value) => (typeof value === 'string' ? value.toLowerCase() : value))
    .matches(SLUG_REGEX).withMessage('El slug solo puede contener letras, numeros y guiones medios.'),
  body('synopsis')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 4000 }).withMessage('La sinopsis no puede superar los 4000 caracteres.'),
  body('author')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage('El autor debe tener entre 2 y 120 caracteres.'),
  body('artist')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage('El artista debe tener entre 2 y 120 caracteres.'),
  body('genres')
    .optional()
    .isArray({ max: 20 }).withMessage('Los generos deben enviarse como un arreglo de hasta 20 elementos.'),
  body('genres.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 60 }).withMessage('Cada genero debe tener entre 1 y 60 caracteres.'),
  body('coverUrl')
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ require_protocol: true }).withMessage('La portada debe ser una URL valida.'),
  body('status')
    .optional()
    .isIn(MANGA_STATUSES).withMessage(`El estado debe ser ${MANGA_STATUSES.join(', ')}.`),
  body('chapters')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 }).withMessage('La cantidad de capitulos debe ser un entero mayor o igual a 0.')
    .toInt(),
  body('publishedFrom')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('publishedFrom debe ser una fecha valida.')
    .toDate(),
  body('publishedTo')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('publishedTo debe ser una fecha valida.')
    .toDate(),
];

const updateMangaValidations = [
  ...mangaIdValidation,
  body()
    .custom((value, { req }) => (
      ['title', 'slug', 'synopsis', 'author', 'artist', 'genres', 'coverUrl', 'status', 'chapters', 'publishedFrom', 'publishedTo']
        .some((field) => req.body[field] !== undefined)
    ))
    .withMessage('Debes enviar al menos un campo para actualizar el manga.'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage('El titulo debe tener entre 2 y 120 caracteres.'),
  body('slug')
    .optional({ values: 'falsy' })
    .trim()
    .customSanitizer((value) => (typeof value === 'string' ? value.toLowerCase() : value))
    .matches(SLUG_REGEX).withMessage('El slug solo puede contener letras, numeros y guiones medios.'),
  body('synopsis')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 4000 }).withMessage('La sinopsis no puede superar los 4000 caracteres.'),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage('El autor debe tener entre 2 y 120 caracteres.'),
  body('artist')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage('El artista debe tener entre 2 y 120 caracteres.'),
  body('genres')
    .optional()
    .isArray({ max: 20 }).withMessage('Los generos deben enviarse como un arreglo de hasta 20 elementos.'),
  body('genres.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 60 }).withMessage('Cada genero debe tener entre 1 y 60 caracteres.'),
  body('coverUrl')
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ require_protocol: true }).withMessage('La portada debe ser una URL valida.'),
  body('status')
    .optional()
    .isIn(MANGA_STATUSES).withMessage(`El estado debe ser ${MANGA_STATUSES.join(', ')}.`),
  body('chapters')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 }).withMessage('La cantidad de capitulos debe ser un entero mayor o igual a 0.')
    .toInt(),
  body('publishedFrom')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('publishedFrom debe ser una fecha valida.')
    .toDate(),
  body('publishedTo')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('publishedTo debe ser una fecha valida.')
    .toDate(),
];

const mangaReviewsValidations = [
  ...mangaIdValidation,
  query('sort')
    .optional()
    .isIn(['recent', 'rating']).withMessage('El orden de reviews debe ser recent o rating.'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La pagina debe ser un entero mayor o igual a 1.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('El limite debe ser un entero entre 1 y 50.')
    .toInt(),
];

const externalMangaSearchValidations = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 }).withMessage('La búsqueda debe tener entre 1 y 120 caracteres.'),
  query('genre')
    .optional()
    .isInt({ min: 1 }).withMessage('El genero debe ser un MAL ID valido.')
    .toInt(),
  query('status')
    .optional()
    .isIn(EXTERNAL_MANGA_STATUSES).withMessage(`El estado externo debe ser ${EXTERNAL_MANGA_STATUSES.join(', ')}.`),
  query('type')
    .optional()
    .isIn(EXTERNAL_MANGA_TYPES).withMessage(`El tipo externo debe ser ${EXTERNAL_MANGA_TYPES.join(', ')}.`),
  query('orderBy')
    .optional()
    .isIn(EXTERNAL_MANGA_ORDER_BY).withMessage(`El orden externo debe ser ${EXTERNAL_MANGA_ORDER_BY.join(', ')}.`),
  query('sort')
    .optional()
    .isIn(['asc', 'desc']).withMessage('El orden de clasificación debe ser asc o desc.'),
  query('minScore')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('El score minimo debe estar entre 0 y 10.')
    .toFloat(),
  query('maxScore')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('El score maximo debe estar entre 0 y 10.')
    .toFloat(),
  query('year')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('El año debe ser valido.')
    .toInt(),
  query('letter')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1 }).withMessage('La letra debe tener un solo caracter.'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La pagina debe ser un entero mayor o igual a 1.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 25 }).withMessage('El limite externo debe ser un entero entre 1 y 25.')
    .toInt(),
  query()
    .custom((value, { req }) => (
      ['q', 'genre', 'status', 'type', 'orderBy', 'minScore', 'maxScore', 'year', 'letter']
        .some((field) => req.query[field] !== undefined && req.query[field] !== '')
    ))
    .withMessage('Debes enviar al menos un criterio para buscar mangas externos.'),
];

const externalTopMangaValidations = [
  query('filter')
    .optional()
    .isIn(['publishing', 'upcoming', 'bypopularity', 'favorite']).withMessage('El filtro top no es valido.'),
  query('type')
    .optional()
    .isIn(EXTERNAL_MANGA_TYPES).withMessage(`El tipo externo debe ser ${EXTERNAL_MANGA_TYPES.join(', ')}.`),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La pagina debe ser un entero mayor o igual a 1.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 25 }).withMessage('El limite externo debe ser un entero entre 1 y 25.')
    .toInt(),
];

const externalMangaIdValidations = [
  param('malId')
    .isInt({ min: 1 }).withMessage('El MAL ID debe ser un entero mayor a 0.')
    .toInt(),
];

const externalMangaImportValidations = [
  body()
    .custom((value, { req }) => Boolean(req.body.malId || req.body.manga))
    .withMessage('Debes enviar un malId o un manga externo normalizado.'),
  body('source')
    .optional()
    .isIn(EXTERNAL_MANGA_SOURCES).withMessage(`La fuente externa debe ser ${EXTERNAL_MANGA_SOURCES.join(', ')}.`),
  body('malId')
    .optional()
    .isInt({ min: 1 }).withMessage('El malId debe ser un entero mayor a 0.')
    .toInt(),
  body('manga.source')
    .optional()
    .isIn(EXTERNAL_MANGA_SOURCES).withMessage(`La fuente del manga debe ser ${EXTERNAL_MANGA_SOURCES.join(', ')}.`),
  body('manga.externalId')
    .optional()
    .isInt({ min: 1 }).withMessage('El externalId debe ser un entero mayor a 0.')
    .toInt(),
  body('manga.title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 160 }).withMessage('El titulo externo debe tener entre 1 y 160 caracteres.'),
];

router.post('/', authMiddleware, requireRole('admin'), createMangaValidations, validateRequest, mangaController.createManga);
router.put('/:id', authMiddleware, requireRole('admin'), updateMangaValidations, validateRequest, mangaController.updateManga);
router.delete('/:id', authMiddleware, requireRole('admin'), mangaIdValidation, validateRequest, mangaController.deleteManga);

router.get('/admin/external/search', authMiddleware, requireRole('admin'), externalMangaSearchValidations, validateRequest, externalMangaController.searchExternalMangas);
router.get('/admin/external/top', authMiddleware, requireRole('admin'), externalTopMangaValidations, validateRequest, externalMangaController.getTopExternalMangas);
router.get('/admin/external/genres', authMiddleware, requireRole('admin'), externalMangaController.getExternalMangaGenres);
router.get('/admin/external/:malId', authMiddleware, requireRole('admin'), externalMangaIdValidations, validateRequest, externalMangaController.getExternalMangaById);
router.post('/admin/external/import', authMiddleware, requireRole('admin'), externalMangaImportValidations, validateRequest, externalMangaController.importExternalManga);

router.get('/admin/external-mangas/search', authMiddleware, requireRole('admin'), externalMangaSearchValidations, validateRequest, externalMangaController.searchExternalMangas);
router.get('/admin/external-mangas/top', authMiddleware, requireRole('admin'), externalTopMangaValidations, validateRequest, externalMangaController.getTopExternalMangas);

router.get('/', listMangaValidations, validateRequest, mangaController.getAllMangas);
router.get('/:id/reviews', mangaReviewsValidations, validateRequest, mangaController.getMangaReviews);
router.get('/:idOrSlug', optionalAuthMiddleware, mangaIdOrSlugValidation, validateRequest, mangaController.getMangaById);

module.exports = router;
