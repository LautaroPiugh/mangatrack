const mangaService = require('../services/manga.service');

const getAllMangas = async (req, res) => {
  const result = await mangaService.getAllMangas(req.query);

  res.status(200).json({
    success: true,
    message: 'Mangas obtenidos correctamente.',
    data: result.items,
    meta: result.pagination,
  });
};

const getMangaById = async (req, res) => {
  const manga = await mangaService.getMangaById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Manga obtenido correctamente.',
    data: manga,
  });
};

const createManga = async (req, res) => {
  const manga = await mangaService.createManga(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Manga creado correctamente.',
    data: manga,
  });
};

const updateManga = async (req, res) => {
  const manga = await mangaService.updateManga(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Manga actualizado correctamente.',
    data: manga,
  });
};

const deleteManga = async (req, res) => {
  const manga = await mangaService.deleteManga(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Manga eliminado correctamente.',
    data: manga,
  });
};

const getMangaReviews = async (req, res) => {
  const result = await mangaService.getMangaReviews(req.params.id, req.query);

  res.status(200).json({
    success: true,
    message: 'Reviews del manga obtenidas correctamente.',
    data: {
      manga: result.manga,
      reviewSummary: result.reviewSummary,
      reviews: result.items,
    },
    meta: result.pagination,
  });
};

module.exports = {
  getAllMangas,
  getMangaById,
  createManga,
  updateManga,
  deleteManga,
  getMangaReviews,
};
