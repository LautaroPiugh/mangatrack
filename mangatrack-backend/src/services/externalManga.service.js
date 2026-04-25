const axios = require('axios');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const {
  BadRequestError,
  NotFoundError,
  ServiceUnavailableError,
  TooManyRequestsError,
} = require('../utils/errors');
const { generateSlug } = require('../utils/manga');

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 25;
const DEFAULT_PAGE = 1;
const DEFAULT_TIMEOUT_MS = 10000;
const CURL_MAX_BUFFER = 2 * 1024 * 1024;
const execFileAsync = promisify(execFile);

const jikanClient = axios.create({
  baseURL: JIKAN_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
});

const JIKAN_STATUS_TO_INTERNAL = {
  publishing: 'ongoing',
  finished: 'completed',
  complete: 'completed',
  'on hiatus': 'hiatus',
  hiatus: 'hiatus',
  discontinued: 'cancelled',
  cancelled: 'cancelled',
  upcoming: 'ongoing',
};

const clampLimit = (value) => Math.min(
  Math.max(Number.parseInt(value, 10) || DEFAULT_LIMIT, 1),
  MAX_LIMIT,
);

const normalizeOptionalArray = (values = []) => [...new Set(
  values
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean),
)];

const toIsoDate = (value) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
};

const resolveCoverImage = (images = {}) => (
  images?.webp?.large_image_url
  || images?.jpg?.large_image_url
  || images?.webp?.image_url
  || images?.jpg?.image_url
  || null
);

const resolveTitleFromType = (titles = [], titleType) => (
  titles.find((title) => title?.type === titleType)?.title || null
);

const mapJikanStatusToInternal = (status = '') => (
  JIKAN_STATUS_TO_INTERNAL[status.toLowerCase()] || 'ongoing'
);

const normalizeExternalGenres = (jikanManga = {}) => normalizeOptionalArray([
  ...(jikanManga.genres || []).map((genre) => genre?.name),
  ...(jikanManga.themes || []).map((genre) => genre?.name),
  ...(jikanManga.demographics || []).map((genre) => genre?.name),
]);

const normalizeExternalAuthors = (jikanManga = {}) => normalizeOptionalArray(
  (jikanManga.authors || []).map((author) => author?.name),
);

const normalizeExternalManga = (jikanManga = {}) => {
  const coverImage = resolveCoverImage(jikanManga.images);
  const authors = normalizeExternalAuthors(jikanManga);

  return {
    externalId: jikanManga.mal_id,
    source: 'jikan',
    title: jikanManga.title || jikanManga.title_english || jikanManga.title_japanese || 'Sin titulo',
    titleEnglish: jikanManga.title_english || resolveTitleFromType(jikanManga.titles, 'English'),
    titleJapanese: jikanManga.title_japanese || resolveTitleFromType(jikanManga.titles, 'Japanese'),
    titleSynonyms: normalizeOptionalArray(jikanManga.title_synonyms || []),
    synopsis: jikanManga.synopsis || '',
    background: jikanManga.background || '',
    coverImage,
    coverUrl: coverImage,
    bannerImage: null,
    status: mapJikanStatusToInternal(jikanManga.status),
    type: jikanManga.type || null,
    chapters: jikanManga.chapters ?? null,
    volumes: jikanManga.volumes ?? null,
    score: jikanManga.score ?? null,
    rank: jikanManga.rank ?? null,
    popularity: jikanManga.popularity ?? null,
    members: jikanManga.members ?? null,
    favorites: jikanManga.favorites ?? null,
    genres: normalizeExternalGenres(jikanManga),
    authors,
    author: authors[0] || '',
    artist: authors[1] || authors[0] || '',
    publishedFrom: toIsoDate(jikanManga.published?.from),
    publishedTo: toIsoDate(jikanManga.published?.to),
    slugSuggestion: generateSlug(jikanManga.title || jikanManga.title_english || `${jikanManga.mal_id || 'manga'}`),
    url: jikanManga.url || null,
  };
};

const normalizeGenreList = (genres = []) => {
  const genresById = new Map();

  genres.forEach((genre) => {
    if (!genre?.mal_id || !genre?.name) {
      return;
    }

    const currentValue = genresById.get(genre.mal_id);

    if (!currentValue || (genre.count || 0) > currentValue.count) {
      genresById.set(genre.mal_id, {
        id: genre.mal_id,
        name: genre.name,
        url: genre.url || null,
        count: genre.count || 0,
      });
    }
  });

  return Array.from(genresById.values())
    .sort((left, right) => left.name.localeCompare(right.name));
};

const normalizePaginationMeta = (pagination = {}) => ({
  page: pagination.current_page || DEFAULT_PAGE,
  limit: pagination.items?.per_page || DEFAULT_LIMIT,
  total: pagination.items?.total ?? null,
  totalPages: pagination.last_visible_page || 1,
  hasNextPage: Boolean(pagination.has_next_page),
});

const buildYearRange = (year) => {
  if (!year) {
    return {};
  }

  return {
    start_date: `${year}-01-01`,
    end_date: `${year}-12-31`,
  };
};

const buildSearchParams = (filters = {}) => {
  const params = {
    page: Math.max(Number.parseInt(filters.page, 10) || DEFAULT_PAGE, 1),
    limit: clampLimit(filters.limit),
  };

  if (filters.q?.trim()) {
    params.q = filters.q.trim();
  }

  if (filters.genre !== undefined && filters.genre !== null && `${filters.genre}` !== '') {
    params.genres = Array.isArray(filters.genre) ? filters.genre.join(',') : filters.genre;
  }

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.type) {
    params.type = filters.type;
  }

  if (filters.orderBy) {
    params.order_by = filters.orderBy;
  }

  if (filters.sort) {
    params.sort = filters.sort;
  }

  if (filters.minScore !== undefined) {
    params.min_score = filters.minScore;
  }

  if (filters.maxScore !== undefined) {
    params.max_score = filters.maxScore;
  }

  if (filters.letter) {
    params.letter = filters.letter;
  }

  Object.assign(params, buildYearRange(filters.year));

  if (filters.startDate) {
    params.start_date = filters.startDate;
  }

  if (filters.endDate) {
    params.end_date = filters.endDate;
  }

  return params;
};

const ensureSearchCriteria = (filters = {}) => {
  const hasCriteria = [
    filters.q,
    filters.genre,
    filters.status,
    filters.type,
    filters.orderBy,
    filters.minScore,
    filters.maxScore,
    filters.year,
    filters.letter,
    filters.startDate,
    filters.endDate,
  ].some((value) => value !== undefined && value !== null && `${value}` !== '');

  if (!hasCriteria) {
    throw new BadRequestError('Debes enviar al menos un criterio para buscar mangas externos.');
  }
};

const buildJikanUrl = (path, params = {}) => {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const requestUrl = new URL(`${JIKAN_BASE_URL}/${normalizedPath}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      requestUrl.searchParams.set(key, value);
    }
  });

  return requestUrl.toString();
};

const normalizeJikanError = (status, message) => {
  if (status === 400 || status === 422) {
    throw new BadRequestError(message);
  }

  if (status === 404) {
    throw new NotFoundError('No se encontró el manga solicitado en Jikan.');
  }

  if (status === 429) {
    throw new TooManyRequestsError('Jikan está limitando solicitudes. Intenta nuevamente en unos segundos.');
  }

  throw new ServiceUnavailableError(`No se pudo consultar Jikan: ${message}`);
};

const requestJikanWithCurl = async (path, params = {}) => {
  const requestUrl = buildJikanUrl(path, params);

  console.info('[external-manga] jikan fallback via curl', {
    path,
    params,
  });

  const { stdout } = await execFileAsync(
    'curl',
    ['-s', '-w', '\n%{http_code}', '--connect-timeout', '10', '--max-time', '15', requestUrl],
    { maxBuffer: CURL_MAX_BUFFER },
  );

  const statusSeparatorIndex = stdout.lastIndexOf('\n');
  const responseBody = statusSeparatorIndex >= 0 ? stdout.slice(0, statusSeparatorIndex) : stdout;
  const statusCode = Number.parseInt(
    statusSeparatorIndex >= 0 ? stdout.slice(statusSeparatorIndex + 1).trim() : '',
    10,
  );

  if (!Number.isInteger(statusCode)) {
    throw new ServiceUnavailableError('No se pudo determinar el estado de respuesta de Jikan.');
  }

  let payload = null;

  try {
    payload = JSON.parse(responseBody || 'null');
  } catch {
    throw new ServiceUnavailableError('Jikan respondió un payload no JSON.');
  }

  if (statusCode >= 400) {
    normalizeJikanError(statusCode, payload?.message || 'No se pudo consultar Jikan.');
  }

  return payload;
};

const requestJikan = async (path, params = {}) => {
  try {
    console.info('[external-manga] jikan request', {
      path,
      params,
    });

    const response = await jikanClient.get(path, { params });

    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const upstreamMessage = error.response?.data?.message || error.message || 'No se pudo consultar Jikan.';
    const networkCode = error.code || error.cause?.code || null;

    if (!error.response) {
      try {
        return await requestJikanWithCurl(path, params);
      } catch (curlError) {
        if (curlError instanceof BadRequestError || curlError instanceof NotFoundError || curlError instanceof TooManyRequestsError || curlError instanceof ServiceUnavailableError) {
          throw curlError;
        }

        throw new ServiceUnavailableError(`No se pudo consultar Jikan: ${networkCode || upstreamMessage}`);
      }
    }

    normalizeJikanError(status, upstreamMessage);
  }
};

const searchExternalMangas = async (filters = {}) => {
  ensureSearchCriteria(filters);

  const payload = await requestJikan('/manga', buildSearchParams(filters));

  return {
    items: (payload.data || []).map(normalizeExternalManga),
    meta: normalizePaginationMeta(payload.pagination),
  };
};

const getTopExternalMangas = async (filters = {}) => {
  const params = {
    page: Math.max(Number.parseInt(filters.page, 10) || DEFAULT_PAGE, 1),
    limit: clampLimit(filters.limit),
  };

  if (filters.filter) {
    params.filter = filters.filter;
  }

  if (filters.type) {
    params.type = filters.type;
  }

  const payload = await requestJikan('/top/manga', params);

  return {
    items: (payload.data || []).map(normalizeExternalManga),
    meta: normalizePaginationMeta(payload.pagination),
  };
};

const getExternalMangaGenres = async () => {
  const payload = await requestJikan('/genres/manga');

  return normalizeGenreList(payload.data || []);
};

const getExternalMangaById = async (malId) => {
  const parsedMalId = Number.parseInt(malId, 10);

  if (!Number.isInteger(parsedMalId) || parsedMalId <= 0) {
    throw new BadRequestError('Debes indicar un MAL ID válido.');
  }

  const payload = await requestJikan(`/manga/${parsedMalId}/full`);

  if (!payload.data) {
    throw new NotFoundError('No se encontró el manga solicitado en Jikan.');
  }

  return normalizeExternalManga(payload.data);
};

module.exports = {
  searchExternalMangas,
  getTopExternalMangas,
  getExternalMangaGenres,
  getExternalMangaById,
  normalizeExternalManga,
};
