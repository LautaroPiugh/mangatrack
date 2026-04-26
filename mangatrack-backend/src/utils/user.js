const USERNAME_REGEX = /^[a-z0-9._-]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;
const USER_ROLES = ['user', 'admin'];
const USER_LANGUAGES = ['es', 'en'];
const PASSWORD_STRENGTH_MESSAGE = 'La contrasena debe tener al menos 8 caracteres, una mayuscula, un numero y un simbolo.';

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeOptionalString = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const normalizeName = (name) => normalizeString(name);

const normalizeEmail = (email) => normalizeString(email).toLowerCase();

const normalizeUsername = (username) => normalizeString(username).toLowerCase();

const isStrongPassword = (password) => (
  typeof password === 'string' && STRONG_PASSWORD_REGEX.test(password)
);

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const normalizedUser = typeof user.toObject === 'function' ? user.toObject() : user;

  return {
    id: normalizedUser._id?.toString() || normalizedUser.id,
    name: normalizedUser.name,
    username: normalizedUser.username,
    displayName: normalizedUser.displayName || null,
    avatar: normalizedUser.avatar || null,
    bio: normalizedUser.bio || null,
    email: normalizedUser.email,
    role: normalizedUser.role,
    isVerified: Boolean(normalizedUser.isVerified),
    verifiedAt: normalizedUser.verifiedAt || null,
    preferences: normalizedUser.preferences || {
      theme: 'dark',
      language: 'es',
    },
    createdAt: normalizedUser.createdAt,
  };
};

const sanitizePublicUser = (user) => {
  if (!user) {
    return null;
  }

  const normalizedUser = typeof user.toObject === 'function' ? user.toObject() : user;

  return {
    id: normalizedUser._id?.toString() || normalizedUser.id,
    name: normalizedUser.name,
    username: normalizedUser.username,
    displayName: normalizedUser.displayName || null,
    avatar: normalizedUser.avatar || null,
    bio: normalizedUser.bio || null,
    createdAt: normalizedUser.createdAt,
  };
};

const getUserDisplayName = (user) => (
  user?.displayName
  || user?.name
  || user?.username
  || 'Usuario'
);

module.exports = {
  USERNAME_REGEX,
  STRONG_PASSWORD_REGEX,
  USER_ROLES,
  USER_LANGUAGES,
  PASSWORD_STRENGTH_MESSAGE,
  normalizeOptionalString,
  normalizeName,
  normalizeEmail,
  normalizeUsername,
  isStrongPassword,
  sanitizeUser,
  sanitizePublicUser,
  getUserDisplayName,
};
