const express = require('express');
const { query } = require('express-validator');

const searchController = require('../controllers/search.controller');
const validateRequest = require('../middleware/validate.middleware');

const router = express.Router();

const searchValidations = [
  query('q')
    .trim()
    .notEmpty().withMessage('La búsqueda es obligatoria.')
    .bail()
    .isLength({ min: 1, max: 80 }).withMessage('La búsqueda debe tener entre 1 y 80 caracteres.'),
];

router.get('/', searchValidations, validateRequest, searchController.search);

module.exports = router;
