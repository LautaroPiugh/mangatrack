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

export const reviewService = {
  async getReviews(params) {
    const payload = await request(`/reviews${buildQuery(params)}`)

    return {
      items: unwrapData(payload),
      meta: payload?.meta || null,
    }
  },
  async getRecentReviews(params) {
    return unwrapData(await request(`/reviews/recent${buildQuery(params)}`))
  },
  async getMyReviews(params) {
    const payload = await request(`/reviews/me${buildQuery(params)}`)

    return {
      items: unwrapData(payload),
      meta: payload?.meta || null,
    }
  },
  async createOrUpdateReview(payload) {
    return unwrapData(await request('/reviews', {
      method: 'POST',
      body: payload,
    }))
  },
  async updateReview(id, payload) {
    return unwrapData(await request(`/reviews/${id}`, {
      method: 'PUT',
      body: payload,
    }))
  },
  async deleteReview(id) {
    return unwrapData(await request(`/reviews/${id}`, {
      method: 'DELETE',
    }))
  },
}

export default reviewService
