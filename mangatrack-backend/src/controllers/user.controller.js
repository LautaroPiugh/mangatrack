const userLibraryService = require('../services/user-library.service');

const getMyProfile = async (req, res) => {
  const profile = await userLibraryService.getMyProfile(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Perfil obtenido correctamente.',
    data: profile,
  });
};

const getMyLibrary = async (req, res) => {
  const library = await userLibraryService.getMyLibrary(req.user.id, req.query);

  res.status(200).json({
    success: true,
    message: 'Biblioteca obtenida correctamente.',
    data: {
      favorites: library.favorites,
      watchlist: library.watchlist,
      reviews: library.reviews,
      stats: library.stats,
    },
    meta: library.meta,
  });
};

const getFavorites = async (req, res) => {
  const favorites = await userLibraryService.getFavorites(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Favoritos obtenidos correctamente.',
    data: favorites,
  });
};

const addFavorite = async (req, res) => {
  const favorites = await userLibraryService.addFavorite(req.user.id, req.params.mangaId);

  res.status(200).json({
    success: true,
    message: 'Manga agregado a favoritos.',
    data: favorites,
  });
};

const removeFavorite = async (req, res) => {
  const favorites = await userLibraryService.removeFavorite(req.user.id, req.params.mangaId);

  res.status(200).json({
    success: true,
    message: 'Manga quitado de favoritos.',
    data: favorites,
  });
};

const getWatchlist = async (req, res) => {
  const watchlist = await userLibraryService.getWatchlist(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Pendientes obtenidos correctamente.',
    data: watchlist,
  });
};

const addToWatchlist = async (req, res) => {
  const watchlist = await userLibraryService.addToWatchlist(req.user.id, req.params.mangaId);

  res.status(200).json({
    success: true,
    message: 'Manga agregado a pendientes.',
    data: watchlist,
  });
};

const removeFromWatchlist = async (req, res) => {
  const watchlist = await userLibraryService.removeFromWatchlist(req.user.id, req.params.mangaId);

  res.status(200).json({
    success: true,
    message: 'Manga quitado de pendientes.',
    data: watchlist,
  });
};

const updatePreferences = async (req, res) => {
  const preferences = await userLibraryService.updatePreferences(req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Preferencias actualizadas correctamente.',
    data: preferences,
  });
};

module.exports = {
  getMyProfile,
  getMyLibrary,
  getFavorites,
  addFavorite,
  removeFavorite,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updatePreferences,
};
