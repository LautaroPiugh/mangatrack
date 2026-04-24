const userRepository = require('../repositories/user.repository');
const { ForbiddenError, UnauthorizedError } = require('../utils/errors');
const { extractBearerToken, verifyAccessToken } = require('../utils/jwt');
const { sanitizeUser } = require('../utils/user');

const resolveAuthenticatedUser = async (authorizationHeader = '', { allowAnonymous = false } = {}) => {
  if (!authorizationHeader) {
    if (allowAnonymous) {
      return null;
    }

    throw new UnauthorizedError('No autorizado. Debes enviar un token Bearer.');
  }

  const token = extractBearerToken(authorizationHeader);
  const payload = verifyAccessToken(token);
  const user = await userRepository.findById(payload.sub);

  if (!user) {
    throw new UnauthorizedError('No autorizado. El usuario no existe.');
  }

  if (!user.isVerified) {
    throw new ForbiddenError('Debes verificar tu cuenta antes de acceder a esta ruta.');
  }

  return sanitizeUser(user);
};

const authMiddleware = async (req, res, next) => {
  req.user = await resolveAuthenticatedUser(req.headers.authorization || '');

  return next();
};

const optionalAuthMiddleware = async (req, res, next) => {
  req.user = await resolveAuthenticatedUser(req.headers.authorization || '', {
    allowAnonymous: true,
  });

  return next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('No autorizado.'));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ForbiddenError('No tienes permisos para acceder a este recurso.'));
  }

  return next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
};
