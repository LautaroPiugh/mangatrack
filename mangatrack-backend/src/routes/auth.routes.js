const express = require('express');
const { body, param } = require('express-validator');

const authController = require('../controllers/auth.controller');
const requireAuth = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');

const router = express.Router();

const registerValidations = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .bail()
    .isLength({ min: 2, max: 60 }).withMessage('El nombre debe tener entre 2 y 60 caracteres.'),
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
    .isLength({ min: 8, max: 72 }).withMessage('La contrasena debe tener entre 8 y 72 caracteres.'),
];

const loginValidations = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio.')
    .bail()
    .isEmail().withMessage('El email no es valido.')
    .bail()
    .normalizeEmail(),
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
router.get('/me', requireAuth, authController.getCurrentUser);

module.exports = router;
