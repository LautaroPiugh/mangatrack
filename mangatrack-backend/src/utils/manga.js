const { normalizeOptionalString } = require('./user');

const MANGA_STATUSES = ['ongoing', 'completed', 'hiatus', 'cancelled'];
const MANGA_SORT_OPTIONS = ['latest', 'rating', 'popular', 'title'];
const EXTERNAL_MANGA_SOURCES = ['jikan'];
const EXTERNAL_MANGA_STATUSES = ['publishing', 'complete', 'hiatus', 'discontinued', 'upcoming'];
const EXTERNAL_MANGA_TYPES = ['manga', 'novel', 'lightnovel', 'oneshot', 'doujin', 'manhwa', 'manhua'];
const EXTERNAL_MANGA_ORDER_BY = [
  'mal_id',
  'title',
  'start_date',
  'end_date',
  'chapters',
  'volumes',
  'score',
  'scored_by',
  'rank',
  'popularity',
  'members',
  'favorites',
];
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
const normalizeTitleForMatching = (value) => normalizeOptionalString(generateSlug(value));

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
  EXTERNAL_MANGA_SOURCES,
  EXTERNAL_MANGA_STATUSES,
  EXTERNAL_MANGA_TYPES,
  EXTERNAL_MANGA_ORDER_BY,
  SLUG_REGEX,
  generateSlug,
  normalizeMangaSlug,
  normalizeTitleForMatching,
  normalizeGenres,
};
