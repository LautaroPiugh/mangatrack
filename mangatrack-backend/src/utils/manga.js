const { normalizeOptionalString } = require('./user');

const MANGA_STATUSES = ['ongoing', 'completed', 'hiatus', 'cancelled'];
const MANGA_SORT_OPTIONS = ['latest', 'rating', 'popular', 'title'];
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const generateSlug = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-{2,}/g, '-');

const normalizeMangaSlug = (value) => normalizeOptionalString(generateSlug(value));

const normalizeGenres = (genres) => {
  if (Array.isArray(genres)) {
    return [...new Set(genres
      .map((genre) => normalizeOptionalString(genre))
      .filter(Boolean))];
  }

  if (typeof genres === 'string') {
    return [...new Set(genres
      .split(',')
      .map((genre) => normalizeOptionalString(genre))
      .filter(Boolean))];
  }

  return [];
};

module.exports = {
  MANGA_STATUSES,
  MANGA_SORT_OPTIONS,
  SLUG_REGEX,
  generateSlug,
  normalizeMangaSlug,
  normalizeGenres,
};
