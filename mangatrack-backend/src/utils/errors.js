const AppError = require('./AppError');

class BadRequestError extends AppError {
  constructor(message = 'Solicitud invalida.', details = null) {
    super(message, 400, {
      code: 'BAD_REQUEST',
      details,
    });
  }
}

class ValidationAppError extends AppError {
  constructor(message = 'Errores de validacion.', details = null) {
    super(message, 400, {
      code: 'VALIDATION_ERROR',
      details,
    });
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado.', details = null) {
    super(message, 401, {
      code: 'UNAUTHORIZED',
      details,
    });
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado.', details = null) {
    super(message, 403, {
      code: 'FORBIDDEN',
      details,
    });
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado.', details = null) {
    super(message, 404, {
      code: 'NOT_FOUND',
      details,
    });
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflicto de datos.', details = null) {
    super(message, 409, {
      code: 'CONFLICT',
      details,
    });
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Error interno del servidor.', details = null) {
    super(message, 500, {
      code: 'INTERNAL_SERVER_ERROR',
      details,
    });
  }
}

module.exports = {
  AppError,
  BadRequestError,
  ValidationAppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
};
