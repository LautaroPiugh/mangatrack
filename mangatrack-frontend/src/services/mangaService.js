import { request, unwrapData } from './api.js'

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export const mangaService = {
  async list(params) {
    return unwrapData(await request(`/mangas${buildQuery(params)}`))
  },
  async getById(id) {
    return unwrapData(await request(`/mangas/${id}`))
  },
}

export default mangaService
