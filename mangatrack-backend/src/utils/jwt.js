const jwt = require('jsonwebtoken');

const { UnauthorizedError } = require('./errors');

const getJwtConfig = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('Falta definir JWT_SECRET en las variables de entorno.');
  }

  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    issuer: process.env.JWT_ISSUER || 'MangaTrack API',
    audience: process.env.JWT_AUDIENCE || 'MangaTrack Client',
  };
};

const generateAccessToken = (user) => {
  const {
    secret,
    expiresIn,
    issuer,
    audience,
  } = getJwtConfig();

  return jwt.sign(
    {
      email: user.email,
      name: user.name,
    },
    secret,
    {
      subject: user._id.toString(),
      expiresIn,
      issuer,
      audience,
    },
  );
};

const extractBearerToken = (authorizationHeader = '') => {
  if (!authorizationHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No autorizado. Debes enviar un token Bearer.');
  }

  const token = authorizationHeader.replace('Bearer ', '').trim();

  if (!token) {
    throw new UnauthorizedError('No autorizado. El token esta vacio.');
  }

  return token;
};

const verifyAccessToken = (token) => {
  const { secret, issuer, audience } = getJwtConfig();

  try {
    return jwt.verify(token, secret, {
      issuer,
      audience,
    });
  } catch (error) {
    throw new UnauthorizedError('Token invalido o expirado.');
  }
};

module.exports = {
  extractBearerToken,
  generateAccessToken,
  verifyAccessToken,
};
