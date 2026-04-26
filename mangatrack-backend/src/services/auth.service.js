const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userRepository = require('../repositories/user.repository');
const {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} = require('../utils/errors');
const { generateAccessToken } = require('../utils/jwt');
const { sendVerificationEmail } = require('./email.service');
const {
  PASSWORD_STRENGTH_MESSAGE,
  isStrongPassword,
  normalizeEmail,
  normalizeName,
  normalizeUsername,
  sanitizeUser,
} = require('../utils/user');

const SALT_ROUNDS = 10;

const ensureStrongPassword = (password) => {
  if (!isStrongPassword(password)) {
    throw new BadRequestError(PASSWORD_STRENGTH_MESSAGE);
  }
};

const register = async ({ name, username, email, password }) => {
  const normalizedName = normalizeName(name);
  const normalizedUsername = normalizeUsername(username);
  const normalizedEmail = normalizeEmail(email);

  ensureStrongPassword(password);

  const [emailAlreadyExists, usernameAlreadyExists] = await Promise.all([
    userRepository.existsByEmail(normalizedEmail),
    userRepository.existsByUsername(normalizedUsername),
  ]);

  if (usernameAlreadyExists) {
    throw new ConflictError('Ya existe un usuario registrado con ese username.');
  }

  if (emailAlreadyExists) {
    throw new ConflictError('Ya existe un usuario registrado con ese email.');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const createdUser = await userRepository.create({
    name: normalizedName,
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    isVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
  });

  try {
    await sendVerificationEmail({
      to: createdUser.email,
      name: createdUser.name,
      token: verificationToken,
    });
  } catch (error) {
    console.error('[AUTH][REGISTER][EMAIL]', {
      userId: createdUser._id.toString(),
      email: createdUser.email,
      message: error.message,
      code: error.code || null,
    });

    try {
      await userRepository.deleteById(createdUser._id);
    } catch (cleanupError) {
      console.error('[AUTH][REGISTER][CLEANUP]', {
        userId: createdUser._id.toString(),
        message: cleanupError.message,
      });
    }

    throw new InternalServerError(
      error.publicMessage || 'No se pudo completar el registro porque fallo el envio del email de verificacion.',
    );
  }

  return {
    user: sanitizeUser(createdUser),
    message: 'Registro exitoso. Revisá tu email para verificar la cuenta.',
  };
};

const verifyAccount = async (verificationToken) => {
  if (!verificationToken) {
    throw new BadRequestError('Token de verificación requerido.');
  }

  const user = await userRepository.findByVerificationToken(verificationToken, {
    includeVerificationToken: true,
  });

  if (!user) {
    throw new BadRequestError('El token de verificación es inválido o ya fue utilizado.');
  }

  if (
    user.emailVerificationExpires
    && user.emailVerificationExpires.getTime() < Date.now()
  ) {
    throw new BadRequestError('El token de verificación expiró.');
  }

  const verifiedUser = await userRepository.markAsVerified(user._id);

  return {
    user: sanitizeUser(verifiedUser),
    message: 'La cuenta fue verificada correctamente.',
  };
};

const login = async ({ username, password }) => {
  const normalizedUsername = normalizeUsername(username);

  const user = await userRepository.findByUsername(normalizedUsername, {
    includePassword: true,
  });

  if (!user) {
    throw new UnauthorizedError('Usuario o contraseña incorrectos.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new UnauthorizedError('Usuario o contraseña incorrectos.');
  }

  if (!user.isVerified) {
    throw new ForbiddenError('Debés verificar tu cuenta antes de iniciar sesión.');
  }

  const token = generateAccessToken(user);

  return {
    token,
    user: sanitizeUser(user),
  };
};

const getCurrentUser = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado.');
  }

  return sanitizeUser(user);
};

module.exports = {
  register,
  verifyAccount,
  login,
  getCurrentUser,
};
