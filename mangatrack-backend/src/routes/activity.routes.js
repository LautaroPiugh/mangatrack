const express = require('express');
const { query } = require('express-validator');

const activityController = require('../controllers/activity.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');

const router = express.Router();

const activityPaginationValidations = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La pagina debe ser un entero mayor o igual a 1.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('El limite debe ser un entero entre 1 y 50.')
    .toInt(),
];

router.get('/feed', activityPaginationValidations, validateRequest, activityController.getFeed);
router.get('/me', authMiddleware, activityPaginationValidations, validateRequest, activityController.getMyActivity);

module.exports = router;
