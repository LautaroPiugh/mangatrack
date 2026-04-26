import axiosClient from '../api/axiosClient.js'
import { buildParams, getCollectionPayload, runRequest } from './http.js'

const activityService = {
  async getFeed(params) {
    return runRequest(async () => {
      const response = await axiosClient.get('/activity/feed', {
        params: buildParams(params),
      })
      return getCollectionPayload(response)
    }, 'No se pudo cargar el feed público.')
  },

  async getMyActivity(params) {
    return runRequest(async () => {
      const response = await axiosClient.get('/activity/me', {
        params: buildParams(params),
      })
      return getCollectionPayload(response)
    }, 'No se pudo cargar tu actividad.')
  },

  async getUserActivity(username, params) {
    return runRequest(async () => {
      const response = await axiosClient.get(`/users/${username}/activity`, {
        params: buildParams(params),
      })

      return {
        items: response.data?.data || [],
        meta: response.data?.meta || null,
      }
    }, 'No se pudo cargar la actividad del usuario.')
  },
}

export default activityService
