const express = require('express');
const { body, param, query } = require('express-validator');

const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');

const router = express.Router();

const mangaIdValidation = [
  param('mangaId')
    .isMongoId().withMessage('El id del manga no es valido.'),
];

const libraryQueryValidation = [
  query('section')
    .optional()
    .isIn(['favorites', 'watchlist', 'reviews']).withMessage('La seccion debe ser favorites, watchlist o reviews.'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La pagina debe ser un entero mayor o igual a 1.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('El limite debe ser un entero entre 1 y 50.')
    .toInt(),
];

const preferencesValidation = [
  body('theme')
    .optional()
    .isIn(['dark', 'light']).withMessage('El tema debe ser dark o light.'),
];

router.use(authMiddleware);

router.get('/me/profile', userController.getMyProfile);
router.get('/me/library', libraryQueryValidation, validateRequest, userController.getMyLibrary);
router.put('/me/preferences', preferencesValidation, validateRequest, userController.updatePreferences);
router.get('/me/favorites', userController.getFavorites);
router.post('/me/favorites/:mangaId', mangaIdValidation, validateRequest, userController.addFavorite);
router.delete('/me/favorites/:mangaId', mangaIdValidation, validateRequest, userController.removeFavorite);

router.get('/me/watchlist', userController.getWatchlist);
router.post('/me/watchlist/:mangaId', mangaIdValidation, validateRequest, userController.addToWatchlist);
router.delete('/me/watchlist/:mangaId', mangaIdValidation, validateRequest, userController.removeFromWatchlist);

module.exports = router;
