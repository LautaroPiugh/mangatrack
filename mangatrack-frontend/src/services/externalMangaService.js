import { buildParams, runRequest } from './http.js'
import axiosClient from '../api/axiosClient.js'

const searchExternalMangas = async (filters = {}) => {
  return runRequest(async () => {
    const response = await axiosClient.get('/mangas/admin/external/search', {
      params: buildParams(filters),
    })

    const pagination = response.data.pagination || response.data.meta || null

    return {
      items: response.data.data || [],
      meta: response.data.meta || pagination,
      pagination,
    }
  }, 'No se pudieron buscar mangas externos.')
}

const getTopExternalMangas = async (filters = {}) => {
  return runRequest(async () => {
    const response = await axiosClient.get('/mangas/admin/external/top', {
      params: buildParams(filters),
    })

    const pagination = response.data.pagination || response.data.meta || null

    return {
      items: response.data.data || [],
      meta: response.data.meta || pagination,
      pagination,
    }
  }, 'No se pudieron cargar mangas destacados.')
}

const getExternalMangaGenres = async () => {
  return runRequest(async () => {
    const response = await axiosClient.get('/mangas/admin/external/genres')
    return response.data.data || []
  }, 'No se pudieron cargar los géneros externos.')
}

const getExternalMangaById = async (malId) => {
  return runRequest(async () => {
    const response = await axiosClient.get(`/mangas/admin/external/${malId}`)
    return response.data.data
  }, 'No se pudo cargar el detalle del manga externo.')
}

const importExternalManga = async (payload) => {
  return runRequest(async () => {
    const response = await axiosClient.post('/mangas/admin/external/import', payload)
    return response.data.data
  }, 'No se pudo importar el manga.')
}

export default {
  searchExternalMangas,
  getTopExternalMangas,
  getExternalMangaGenres,
  getExternalMangaById,
  importExternalManga,
}
