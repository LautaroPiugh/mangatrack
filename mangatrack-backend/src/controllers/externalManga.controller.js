const externalMangaService = require('../services/externalManga.service');
const mangaService = require('../services/manga.service');

const searchExternalMangas = async (req, res) => {
  const result = await externalMangaService.searchExternalMangas(req.query);

  res.status(200).json({
    success: true,
    message: 'Mangas externos encontrados correctamente.',
    data: result.items,
    meta: result.meta,
    pagination: result.pagination,
  });
};

const getTopExternalMangas = async (req, res) => {
  const result = await externalMangaService.getTopExternalMangas(req.query);

  res.status(200).json({
    success: true,
    message: 'Top mangas externos obtenidos correctamente.',
    data: result.items,
    meta: result.meta,
    pagination: result.pagination,
  });
};

const getExternalMangaGenres = async (req, res) => {
  const genres = await externalMangaService.getExternalMangaGenres();

  res.status(200).json({
    success: true,
    message: 'Generos externos obtenidos correctamente.',
    data: genres,
    meta: {
      total: genres.length,
    },
  });
};

const getExternalMangaById = async (req, res) => {
  const manga = await externalMangaService.getExternalMangaById(req.params.malId);

  res.status(200).json({
    success: true,
    message: 'Detalle del manga externo obtenido correctamente.',
    data: manga,
  });
};

const importExternalManga = async (req, res) => {
  const result = await mangaService.importExternalManga(req.body, req.user.id);

  res.status(result.imported ? 201 : 200).json({
    success: true,
    message: result.message,
    data: {
      manga: result.manga,
      imported: result.imported,
      duplicate: result.duplicate,
      reason: result.duplicateReason,
    },
  });
};

module.exports = {
  searchExternalMangas,
  getTopExternalMangas,
  getExternalMangaGenres,
  getExternalMangaById,
  importExternalManga,
};
