const express = require('express');
const { body, param } = require('express-validator');

const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const {
  PASSWORD_STRENGTH_MESSAGE,
  STRONG_PASSWORD_REGEX,
  USERNAME_REGEX,
} = require('../utils/user');

const router = express.Router();

const registerValidations = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .bail()
    .isLength({ min: 2, max: 60 }).withMessage('El nombre debe tener entre 2 y 60 caracteres.'),
  body('username')
    .trim()
    .customSanitizer((value) => (typeof value === 'string' ? value.toLowerCase() : value))
    .notEmpty().withMessage('El username es obligatorio.')
    .bail()
    .isLength({ min: 3, max: 30 }).withMessage('El username debe tener entre 3 y 30 caracteres.')
    .bail()
    .matches(USERNAME_REGEX).withMessage('El username solo puede contener letras, numeros, puntos, guiones y guion bajo.'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio.')
    .bail()
    .isEmail().withMessage('El email no es valido.')
    .bail()
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contrasena es obligatoria.')
    .bail()
    .matches(STRONG_PASSWORD_REGEX).withMessage(PASSWORD_STRENGTH_MESSAGE),
];

const loginValidations = [
  body('username')
    .trim()
    .customSanitizer((value) => (typeof value === 'string' ? value.toLowerCase() : value))
    .notEmpty().withMessage('El username es obligatorio.')
    .bail()
    .isLength({ min: 3, max: 30 }).withMessage('El username debe tener entre 3 y 30 caracteres.')
    .bail()
    .matches(USERNAME_REGEX).withMessage('El username solo puede contener letras, numeros, puntos, guiones y guion bajo.'),
  body('password')
    .notEmpty().withMessage('La contrasena es obligatoria.'),
];

const verifyValidations = [
  param('token')
    .trim()
    .notEmpty().withMessage('El token de verificacion es obligatorio.'),
];

router.post('/register', registerValidations, validateRequest, authController.register);
router.get('/verify/:token', verifyValidations, validateRequest, authController.verifyAccount);
router.post('/login', loginValidations, validateRequest, authController.login);
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
