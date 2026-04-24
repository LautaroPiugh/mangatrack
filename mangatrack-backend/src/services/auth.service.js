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
const { sendVerificationEmail } = require('../utils/email');
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

  const createdUser = await userRepository.create({
    name: normalizedName,
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    verificationToken,
  });

  try {
    await sendVerificationEmail({
      to: createdUser.email,
      name: createdUser.name,
      verificationToken,
    });
  } catch (error) {
    await userRepository.deleteById(createdUser._id);
    throw new InternalServerError('No se pudo completar el registro porque fallo el envio del email.');
  }

  return {
    user: sanitizeUser(createdUser),
    message: 'Registro exitoso. Revisa tu email para verificar la cuenta.',
  };
};

const verifyAccount = async (verificationToken) => {
  const user = await userRepository.findByVerificationToken(verificationToken, {
    includeVerificationToken: true,
  });

  if (!user) {
    throw new BadRequestError('El token de verificacion es invalido o ya fue utilizado.');
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
    throw new UnauthorizedError('Usuario o contrasena incorrectos.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new UnauthorizedError('Usuario o contrasena incorrectos.');
  }

  if (!user.isVerified) {
    throw new ForbiddenError('Debes verificar tu cuenta antes de iniciar sesion.');
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
