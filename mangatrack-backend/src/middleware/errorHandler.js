const {
  AppError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  UnauthorizedError,
  ValidationAppError,
} = require('../utils/errors');

const normalizeError = (error) => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return new BadRequestError('El cuerpo JSON de la solicitud no es valido.');
  }

  if (error.name === 'ValidationError') {
    const details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));

    return new ValidationAppError('Error de validacion.', details);
  }

  if (error.name === 'CastError') {
    return new BadRequestError(`El valor enviado para ${error.path} no es valido.`);
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return new UnauthorizedError('Token invalido o expirado.');
  }

  if (error.code === 11000) {
    const duplicatedFields = Object.keys(error.keyValue);
    return new ConflictError(`Ya existe un registro con ${duplicatedFields.join(', ')}.`);
  }

  return new InternalServerError('Error interno del servidor.');
};

const errorHandler = (error, req, res, next) => {
  const normalizedError = normalizeError(error);

  const payload = {
    success: false,
    message: normalizedError.message,
    code: normalizedError.code,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  };

  if (normalizedError.details) {
    payload.details = normalizedError.details;
  }

  if (process.env.NODE_ENV !== 'production' && error.stack) {
    payload.stack = error.stack;
  }

  if (normalizedError.statusCode >= 500) {
    console.error(error);
  }

  res.status(normalizedError.statusCode).json(payload);
};

module.exports = errorHandler;
