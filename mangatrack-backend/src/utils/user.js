const USERNAME_REGEX = /^[a-z0-9._-]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;
const USER_ROLES = ['user', 'admin'];
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
    email: normalizedUser.email,
    role: normalizedUser.role,
  };
};

module.exports = {
  USERNAME_REGEX,
  STRONG_PASSWORD_REGEX,
  USER_ROLES,
  PASSWORD_STRENGTH_MESSAGE,
  normalizeOptionalString,
  normalizeName,
  normalizeEmail,
  normalizeUsername,
  isStrongPassword,
  sanitizeUser,
};
