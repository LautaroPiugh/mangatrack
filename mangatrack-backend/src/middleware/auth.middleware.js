const userRepository = require('../repositories/user.repository');
const { ForbiddenError, UnauthorizedError } = require('../utils/errors');
const { extractBearerToken, verifyAccessToken } = require('../utils/jwt');

const requireAuth = async (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization || '');
  const payload = verifyAccessToken(token);
  const user = await userRepository.findById(payload.sub);

  if (!user) {
    return next(new UnauthorizedError('No autorizado. El usuario no existe.'));
  }

  if (!user.isVerified) {
    return next(new ForbiddenError('Debes verificar tu cuenta antes de acceder a esta ruta.'));
  }

  req.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
  };

  return next();
};

module.exports = requireAuth;
