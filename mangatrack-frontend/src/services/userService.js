import axiosClient from '../api/axiosClient.js'
import { buildParams, getPayloadData, runRequest } from './http.js'

export const userService = {
  async getMyProfile() {
    return runRequest(async () => {
      const response = await axiosClient.get('/users/me/profile')
      return getPayloadData(response)
    }, 'No se pudo cargar tu perfil.')
  },
  async getMyLibrary(params) {
    return runRequest(async () => {
      const response = await axiosClient.get('/users/me/library', {
        params: buildParams(params),
      })

      return {
        ...(getPayloadData(response) || {}),
        meta: response.data?.meta || null,
      }
    }, 'No se pudo cargar tu biblioteca.')
  },
  async updatePreferences(preferences) {
    return runRequest(async () => {
      const response = await axiosClient.put('/users/me/preferences', preferences)
      return getPayloadData(response)
    }, 'No se pudieron actualizar las preferencias.')
  },
}

export default userService
