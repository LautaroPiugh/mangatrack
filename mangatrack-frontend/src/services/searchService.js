import axiosClient from '../api/axiosClient.js'
import { getPayloadData, runRequest } from './http.js'

const searchService = {
  async search(query) {
    return runRequest(async () => {
      const response = await axiosClient.get('/search', {
        params: {
          q: query,
        },
      })

      const data = getPayloadData(response) || {}

      return {
        users: Array.isArray(data.users) ? data.users : [],
        mangas: Array.isArray(data.mangas) ? data.mangas : [],
      }
    }, 'No se pudo completar la búsqueda global.')
  },
}

export default searchService
