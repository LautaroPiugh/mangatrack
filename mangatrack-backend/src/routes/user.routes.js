const express = require('express');
const { body, param, query } = require('express-validator');

const activityController = require('../controllers/activity.controller');
const listController = require('../controllers/list.controller');
const userController = require('../controllers/user.controller');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const { listIdAliasValidation } = require('./list.routes');
const { USERNAME_REGEX, USER_LANGUAGES } = require('../utils/user');

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
  body('language')
    .optional()
    .isIn(USER_LANGUAGES).withMessage(`El idioma debe ser ${USER_LANGUAGES.join(' o ')}.`),
];

const usernameValidation = [
  param('username')
    .trim()
    .customSanitizer((value) => (typeof value === 'string' ? value.toLowerCase() : value))
    .notEmpty().withMessage('El username es obligatorio.')
    .bail()
    .isLength({ min: 3, max: 30 }).withMessage('El username debe tener entre 3 y 30 caracteres.')
    .bail()
    .matches(USERNAME_REGEX).withMessage('El username solo puede contener letras, numeros, puntos, guiones y guion bajo.'),
];

const userIdValidation = [
  param('id')
    .isMongoId().withMessage('El id del usuario no es valido.'),
];

const profileUpdateValidation = [
  body()
    .custom((value, { req }) => (
      ['username', 'displayName', 'avatar', 'bio', 'preferredLanguage', 'theme']
        .some((field) => req.body[field] !== undefined)
    ))
    .withMessage('Debes enviar al menos un campo para actualizar el perfil.'),
  body('username')
    .optional()
    .trim()
    .customSanitizer((value) => (typeof value === 'string' ? value.toLowerCase() : value))
    .isLength({ min: 3, max: 30 }).withMessage('El username debe tener entre 3 y 30 caracteres.')
    .bail()
    .matches(USERNAME_REGEX).withMessage('El username solo puede contener letras, numeros, puntos, guiones y guion bajo.'),
  body('displayName')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage('El nombre visible debe tener entre 2 y 60 caracteres.'),
  body('avatar')
  .optional()
  .isIn([
    'avatar_ninja',
    'avatar_samurai',
    'avatar_student',
    'avatar_robot',
    'avatar_cat',
    'avatar_oni',
    'avatar_explorer',
    'avatar_mage',
  ])
  .withMessage('Avatar inválido'),
  body('bio')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 280 }).withMessage('La bio no puede superar los 280 caracteres.'),
  body('preferredLanguage')
    .optional()
    .isIn(USER_LANGUAGES).withMessage(`El idioma debe ser ${USER_LANGUAGES.join(' o ')}.`),
  body('theme')
    .optional()
    .isIn(['dark', 'light']).withMessage('El tema debe ser dark o light.'),
];

const activityQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La pagina debe ser un entero mayor o igual a 1.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('El limite debe ser un entero entre 1 y 50.')
    .toInt(),
];

router.get('/:id', optionalAuthMiddleware, userIdValidation, validateRequest, userController.getPublicProfileById);
router.get('/:id/followers', userIdValidation, validateRequest, userController.getFollowers);
router.get('/:id/following', userIdValidation, validateRequest, userController.getFollowing);
router.get('/:username/public', optionalAuthMiddleware, usernameValidation, validateRequest, userController.getPublicProfile);
router.get('/:username/lists', optionalAuthMiddleware, usernameValidation, validateRequest, listController.getUserLists);
router.get('/:username/lists/:listId', optionalAuthMiddleware, [...usernameValidation, ...listIdAliasValidation], validateRequest, listController.getUserListByUsername);
router.get('/:username/activity', optionalAuthMiddleware, [...usernameValidation, ...activityQueryValidation], validateRequest, activityController.getUserActivity);

router.use(authMiddleware);

router.get('/me/profile', userController.getMyProfile);
router.patch('/me/profile', profileUpdateValidation, validateRequest, userController.updateMyProfile);
router.get('/me/library', libraryQueryValidation, validateRequest, userController.getMyLibrary);
router.put('/me/preferences', preferencesValidation, validateRequest, userController.updatePreferences);
router.get('/me/favorites', userController.getFavorites);
router.post('/me/favorites/:mangaId', mangaIdValidation, validateRequest, userController.addFavorite);
router.delete('/me/favorites/:mangaId', mangaIdValidation, validateRequest, userController.removeFavorite);

router.get('/me/watchlist', userController.getWatchlist);
router.post('/me/watchlist/:mangaId', mangaIdValidation, validateRequest, userController.addToWatchlist);
router.delete('/me/watchlist/:mangaId', mangaIdValidation, validateRequest, userController.removeFromWatchlist);
router.post('/:id/follow', userIdValidation, validateRequest, userController.followUser);
router.delete('/:id/unfollow', userIdValidation, validateRequest, userController.unfollowUser);

module.exports = router;
