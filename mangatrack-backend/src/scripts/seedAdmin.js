require('dotenv').config();

const bcrypt = require('bcrypt');

const { connectDB, disconnectDB } = require('../config/db');
const userRepository = require('../repositories/user.repository');
const { ConflictError } = require('../utils/errors');
const {
  PASSWORD_STRENGTH_MESSAGE,
  isStrongPassword,
  normalizeEmail,
  normalizeName,
  normalizeUsername,
  sanitizeUser,
} = require('../utils/user');

const SALT_ROUNDS = 10;
const REQUIRED_ENV_VARS = ['ADMIN_NAME', 'ADMIN_USERNAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];

const getAdminConfig = () => {
  const missingEnvVars = REQUIRED_ENV_VARS.filter((envVarName) => !process.env[envVarName]?.trim());

  if (missingEnvVars.length > 0) {
    throw new Error(`Faltan variables obligatorias para seed:admin: ${missingEnvVars.join(', ')}.`);
  }

  if (!isStrongPassword(process.env.ADMIN_PASSWORD)) {
    throw new Error(PASSWORD_STRENGTH_MESSAGE);
  }

  return {
    name: normalizeName(process.env.ADMIN_NAME),
    username: normalizeUsername(process.env.ADMIN_USERNAME),
    email: normalizeEmail(process.env.ADMIN_EMAIL),
    password: process.env.ADMIN_PASSWORD,
  };
};

const seedAdmin = async () => {
  const adminConfig = getAdminConfig();
  const [userByUsername, userByEmail] = await Promise.all([
    userRepository.findByUsername(adminConfig.username),
    userRepository.findByEmail(adminConfig.email),
  ]);

  if (
    userByUsername
    && userByEmail
    && userByUsername._id.toString() !== userByEmail._id.toString()
  ) {
    throw new ConflictError('ADMIN_USERNAME y ADMIN_EMAIL corresponden a usuarios distintos.');
  }

  const existingUser = userByUsername || userByEmail;

  if (existingUser?.role === 'admin' && existingUser.isVerified) {
    console.log('El admin ya existe. No se realizaron cambios.');
    console.log(JSON.stringify(sanitizeUser(existingUser), null, 2));
    return;
  }

  const hashedPassword = await bcrypt.hash(adminConfig.password, SALT_ROUNDS);

  if (existingUser) {
    const updatedAdmin = await userRepository.updateById(existingUser._id, {
      name: adminConfig.name,
      username: adminConfig.username,
      email: adminConfig.email,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      verificationToken: null,
    });

    console.log('Usuario existente promovido a admin.');
    console.log(JSON.stringify(sanitizeUser(updatedAdmin), null, 2));
    return;
  }

  const createdAdmin = await userRepository.create({
    name: adminConfig.name,
    username: adminConfig.username,
    email: adminConfig.email,
    password: hashedPassword,
    role: 'admin',
    isVerified: true,
    verificationToken: null,
  });

  console.log('Admin creado correctamente.');
  console.log(JSON.stringify(sanitizeUser(createdAdmin), null, 2));
};

const run = async () => {
  try {
    await connectDB();
    await seedAdmin();
  } catch (error) {
    console.error('No se pudo ejecutar seed:admin:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();
