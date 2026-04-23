const { validationResult } = require('express-validator');

const { ValidationAppError } = require('../utils/errors');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const details = errors.array().map((error) => ({
    field: error.path || 'request',
    message: error.msg,
    location: error.location,
    value: error.value,
  }));

  return next(new ValidationAppError('Errores de validacion.', details));
};

module.exports = validateRequest;
