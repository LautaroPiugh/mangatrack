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
  async getMangas(params) {
    const payload = await request(`/mangas${buildQuery(params)}`)

    return {
      items: unwrapData(payload),
      meta: payload?.meta || null,
    }
  },
  async getManga(idOrSlug) {
    return unwrapData(await request(`/mangas/${idOrSlug}`))
  },
  async getMangaReviews(id, params) {
    const payload = await request(`/mangas/${id}/reviews${buildQuery(params)}`)

    return {
      manga: payload?.data?.manga || null,
      reviewSummary: payload?.data?.reviewSummary || null,
      items: payload?.data?.reviews || [],
      meta: payload?.meta || null,
    }
  },
  async createManga(payload) {
    return unwrapData(await request('/mangas', {
      method: 'POST',
      body: payload,
    }))
  },
  async updateManga(id, payload) {
    return unwrapData(await request(`/mangas/${id}`, {
      method: 'PUT',
      body: payload,
    }))
  },
  async deleteManga(id) {
    return unwrapData(await request(`/mangas/${id}`, {
      method: 'DELETE',
    }))
  },
}

export default mangaService
