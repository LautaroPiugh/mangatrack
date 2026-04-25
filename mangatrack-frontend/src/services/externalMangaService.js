import axiosClient, { getApiErrorMessage } from '../api/axiosClient.js'

const buildParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
)

const searchExternalMangas = async (filters = {}) => {
  try {
    const response = await axiosClient.get('/mangas/admin/external/search', {
      params: buildParams(filters),
    })

    return {
      items: response.data.data || [],
      meta: response.data.meta || null,
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'No se pudieron buscar mangas externos.'))
  }
}

const getTopExternalMangas = async (filters = {}) => {
  try {
    const response = await axiosClient.get('/mangas/admin/external/top', {
      params: buildParams(filters),
    })

    return {
      items: response.data.data || [],
      meta: response.data.meta || null,
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'No se pudieron cargar mangas destacados.'))
  }
}

const getExternalMangaGenres = async () => {
  try {
    const response = await axiosClient.get('/mangas/admin/external/genres')
    return response.data.data || []
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'No se pudieron cargar los géneros externos.'))
  }
}

const getExternalMangaById = async (malId) => {
  try {
    const response = await axiosClient.get(`/mangas/admin/external/${malId}`)
    return response.data.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'No se pudo cargar el detalle del manga externo.'))
  }
}

const importExternalManga = async (payload) => {
  try {
    const response = await axiosClient.post('/mangas/admin/external/import', payload)
    return response.data.data
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'No se pudo importar el manga.'))
  }
}

export default {
  searchExternalMangas,
  getTopExternalMangas,
  getExternalMangaGenres,
  getExternalMangaById,
  importExternalManga,
}
