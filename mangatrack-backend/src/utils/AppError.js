class AppError extends Error {
  constructor(message = 'Error interno del servidor.', statusCode = 500, detailsOrOptions = null) {
    super(message);

    const options = (
      detailsOrOptions
      && !Array.isArray(detailsOrOptions)
      && typeof detailsOrOptions === 'object'
      && (
        Object.hasOwn(detailsOrOptions, 'details')
        || Object.hasOwn(detailsOrOptions, 'code')
        || Object.hasOwn(detailsOrOptions, 'expose')
        || Object.hasOwn(detailsOrOptions, 'isOperational')
      )
    )
      ? detailsOrOptions
      : { details: detailsOrOptions };

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = options.code || 'APP_ERROR';
    this.details = options.details || null;
    this.isOperational = options.isOperational !== false;
    this.expose = options.expose !== false;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
