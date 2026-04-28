const mangaRepository = require('../repositories/manga.repository');
const userRepository = require('../repositories/user.repository');

const SEARCH_LIMIT = 6;

const search = async (query) => {
  const normalizedQuery = typeof query === 'string' ? query.trim() : '';

  if (!normalizedQuery) {
    return {
      users: [],
      mangas: [],
    };
  }

  const [users, mangas] = await Promise.all([
    userRepository.searchByUsername(normalizedQuery, { limit: SEARCH_LIMIT }),
    mangaRepository.searchByTitle(normalizedQuery, { limit: SEARCH_LIMIT }),
  ]);

  return {
    users,
    mangas,
  };
};

module.exports = {
  search,
};
