const userLibraryService = require('../services/user-library.service');
const userProfileService = require('../services/user-profile.service');

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

const getPublicProfile = async (req, res) => {
  const profile = await userProfileService.getPublicProfile(req.params.username, req.user || null);

  res.status(200).json({
    success: true,
    message: 'Perfil público obtenido correctamente.',
    data: profile,
  });
};

const getPublicProfileById = async (req, res) => {
  const profile = await userProfileService.getPublicProfileById(req.params.id, req.user || null);

  res.status(200).json({
    success: true,
    message: 'Perfil público obtenido correctamente.',
    data: profile,
  });
};

const updateMyProfile = async (req, res) => {
  const profile = await userProfileService.updateMyProfile(req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Perfil actualizado correctamente.',
    data: profile,
  });
};

const followUser = async (req, res) => {
  const result = await userProfileService.followUser(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Ahora sigues a este usuario.',
    data: result,
  });
};

const unfollowUser = async (req, res) => {
  const result = await userProfileService.unfollowUser(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Dejaste de seguir a este usuario.',
    data: result,
  });
};

const getFollowers = async (req, res) => {
  const result = await userProfileService.getFollowers(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Seguidores obtenidos correctamente.',
    data: result.items,
    meta: {
      total: result.items.length,
      user: result.user,
    },
  });
};

const getFollowing = async (req, res) => {
  const result = await userProfileService.getFollowing(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Seguidos obtenidos correctamente.',
    data: result.items,
    meta: {
      total: result.items.length,
      user: result.user,
    },
  });
};

module.exports = {
  getMyProfile,
  getPublicProfile,
  getPublicProfileById,
  updateMyProfile,
  getMyLibrary,
  getFavorites,
  addFavorite,
  removeFavorite,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  updatePreferences,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
