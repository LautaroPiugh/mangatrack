const express = require('express');
const { body, param } = require('express-validator');

const listController = require('../controllers/list.controller');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');

const router = express.Router();

const listIdValidation = [
  param('id')
    .isMongoId().withMessage('El id de la lista no es valido.'),
];

const listIdAliasValidation = [
  param('listId')
    .isMongoId().withMessage('El id de la lista no es valido.'),
];

const mangaIdValidation = [
  param('mangaId')
    .isMongoId().withMessage('El id del manga no es valido.'),
];

const createListValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('El titulo es obligatorio.')
    .bail()
    .isLength({ min: 2, max: 80 }).withMessage('El titulo debe tener entre 2 y 80 caracteres.'),
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 }).withMessage('La descripcion no puede superar los 500 caracteres.'),
  body('visibility')
    .optional()
    .isIn(['public', 'private']).withMessage('La visibilidad debe ser public o private.'),
];

const updateListValidation = [
  ...listIdValidation,
  body()
    .custom((value, { req }) => (
      ['title', 'description', 'visibility'].some((field) => req.body[field] !== undefined)
    ))
    .withMessage('Debes enviar al menos un campo para actualizar la lista.'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage('El titulo debe tener entre 2 y 80 caracteres.'),
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 }).withMessage('La descripcion no puede superar los 500 caracteres.'),
  body('visibility')
    .optional()
    .isIn(['public', 'private']).withMessage('La visibilidad debe ser public o private.'),
];

const addItemValidation = [
  ...listIdValidation,
  body('mangaId')
    .isMongoId().withMessage('El id del manga es obligatorio y debe ser valido.'),
  body('note')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 280 }).withMessage('La nota no puede superar los 280 caracteres.'),
];

const reorderValidation = [
  ...listIdValidation,
  body('items')
    .isArray({ min: 1 }).withMessage('Debes enviar un arreglo de items.'),
  body('items.*.mangaId')
    .isMongoId().withMessage('Cada mangaId debe ser un ObjectId valido.'),
];

router.get('/me', authMiddleware, listController.getMyLists);
router.post('/', authMiddleware, createListValidation, validateRequest, listController.createList);
router.get('/:id', optionalAuthMiddleware, listIdValidation, validateRequest, listController.getListById);
router.patch('/:id', authMiddleware, updateListValidation, validateRequest, listController.updateList);
router.delete('/:id', authMiddleware, listIdValidation, validateRequest, listController.deleteList);
router.post('/:id/items', authMiddleware, addItemValidation, validateRequest, listController.addItemToList);
router.delete('/:id/items/:mangaId', authMiddleware, [...listIdValidation, ...mangaIdValidation], validateRequest, listController.removeItemFromList);
router.patch('/:id/items/reorder', authMiddleware, reorderValidation, validateRequest, listController.reorderListItems);

module.exports = {
  listRouter: router,
  listIdAliasValidation,
};
