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
const { sendVerificationEmail } = require('../utils/email');
const { generateAccessToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

const normalizeEmail = (email) => email.toLowerCase().trim();

const register = async ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const userAlreadyExists = await userRepository.existsByEmail(normalizedEmail);

  if (userAlreadyExists) {
    throw new ConflictError('Ya existe un usuario registrado con ese email.');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const createdUser = await userRepository.create({
    name: name.trim(),
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
    user: createdUser,
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
    user: verifiedUser,
    message: 'La cuenta fue verificada correctamente.',
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await userRepository.findByEmail(normalizedEmail, {
    includePassword: true,
  });

  if (!user) {
    throw new UnauthorizedError('Email o contrasena incorrectos.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new UnauthorizedError('Email o contrasena incorrectos.');
  }

  if (!user.isVerified) {
    throw new ForbiddenError('Debes verificar tu cuenta antes de iniciar sesion.');
  }

  const token = generateAccessToken(user);

  return {
    token,
    user,
  };
};

const getCurrentUser = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('Usuario no encontrado.');
  }

  return user;
};

module.exports = {
  register,
  verifyAccount,
  login,
  getCurrentUser,
};
