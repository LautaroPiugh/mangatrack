const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userRepository = require('../repositories/user.repository');
const {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} = require('../utils/errors');
const { generateAccessToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./email.service');
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
  const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
  const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const createdUser = await userRepository.create({
    name: normalizedName,
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    isVerified: false,
    emailVerificationToken: verificationTokenHash,
    emailVerificationTokenExpiresAt: verificationExpires,
    lastVerificationEmailSentAt: new Date(),
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

  const expiresAt = user.emailVerificationTokenExpiresAt || user.emailVerificationExpires;

  if (expiresAt && expiresAt.getTime() < Date.now()) {
    throw new BadRequestError('El enlace de verificación expiró. Solicitá uno nuevo.');
  }

  const verifiedUser = await userRepository.markAsVerified(user._id);

  return {
    user: sanitizeUser(verifiedUser),
    message: 'La cuenta fue verificada correctamente.',
  };
};

const resendVerificationEmail = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await userRepository.findByEmail(normalizedEmail, {
    includeVerificationToken: true,
  });

  if (!user) {
    return {
      message: 'Si existe una cuenta con ese email, enviaremos un nuevo correo.',
    };
  }

  if (user.isVerified) {
    return {
      message: 'Tu cuenta ya está verificada.',
    };
  }

  const lastSentAt = user.lastVerificationEmailSentAt;
  if (lastSentAt && Date.now() - lastSentAt.getTime() < 1000 * 60) {
    throw new TooManyRequestsError('Esperá un minuto antes de reenviar el correo de verificación.');
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
  const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const updatedUser = await userRepository.updateById(user._id, {
    emailVerificationToken: verificationTokenHash,
    emailVerificationTokenExpiresAt: verificationExpires,
    lastVerificationEmailSentAt: new Date(),
  }, {
    includeVerificationToken: true,
  });

  try {
    await sendVerificationEmail({
      to: updatedUser.email,
      name: updatedUser.name,
      token: verificationToken,
    });
  } catch (error) {
    console.error('[AUTH][RESEND_VERIFICATION][EMAIL]', {
      userId: updatedUser._id.toString(),
      email: updatedUser.email,
      message: error.message,
      code: error.code || null,
    });
    throw new InternalServerError('No se pudo reenviar el correo de verificación. Intentá nuevamente más tarde.');
  }

  return {
    message: 'Si existe una cuenta con ese email, enviaremos un nuevo correo.',
  };
};

const forgotPassword = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    return {
      message: 'Si existe una cuenta con ese email, enviaremos instrucciones para recuperar la contraseña.',
    };
  }

  const lastRequestedAt = user.passwordResetRequestedAt;
  if (lastRequestedAt && Date.now() - lastRequestedAt.getTime() < 1000 * 60) {
    return {
      message: 'Si existe una cuenta con ese email, enviaremos instrucciones para recuperar la contraseña.',
    };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetExpires = new Date(Date.now() + 1000 * 60 * 60);

  const updatedUser = await userRepository.updateById(user._id, {
    passwordResetToken: resetTokenHash,
    passwordResetTokenExpiresAt: resetExpires,
    passwordResetRequestedAt: new Date(),
  }, {
    includeResetToken: true,
  });

  try {
    await sendPasswordResetEmail({
      to: updatedUser.email,
      name: updatedUser.name,
      token: resetToken,
    });
  } catch (error) {
    console.error('[AUTH][FORGOT_PASSWORD][EMAIL]', {
      userId: updatedUser._id.toString(),
      email: updatedUser.email,
      message: error.message,
      code: error.code || null,
    });
    return {
      message: 'Si existe una cuenta con ese email, enviaremos instrucciones para recuperar la contraseña.',
    };
  }

  return {
    message: 'Si existe una cuenta con ese email, enviaremos instrucciones para recuperar la contraseña.',
  };
};

const resetPassword = async ({ token, password }) => {
  if (!token) {
    throw new BadRequestError('Token de restablecimiento requerido.');
  }

  ensureStrongPassword(password);

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await userRepository.findByPasswordResetToken(tokenHash, {
    includeResetToken: true,
  });

  if (!user) {
    throw new BadRequestError('El enlace para restablecer la contraseña es inválido o expiró.');
  }

  if (
    !user.passwordResetTokenExpiresAt
    || user.passwordResetTokenExpiresAt.getTime() < Date.now()
  ) {
    throw new BadRequestError('El enlace para restablecer la contraseña es inválido o expiró.');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  await userRepository.updateById(user._id, {
    password: hashedPassword,
    passwordResetToken: null,
    passwordResetTokenExpiresAt: null,
    passwordResetRequestedAt: null,
  });

  return {
    message: 'Contraseña restablecida correctamente. Ya podés iniciar sesión con tu nueva contraseña.',
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
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  login,
  getCurrentUser,
};
