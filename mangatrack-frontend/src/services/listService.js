import axiosClient from '../api/axiosClient.js'
import { getCollectionPayload, getPayloadData, runRequest } from './http.js'

const listService = {
  async getMyLists() {
    return runRequest(async () => {
      const response = await axiosClient.get('/lists/me')
      return getCollectionPayload(response)
    }, 'No se pudieron cargar tus listas.')
  },

  async createList(payload) {
    return runRequest(async () => {
      const response = await axiosClient.post('/lists', payload)
      return getPayloadData(response)
    }, 'No se pudo crear la lista.')
  },

  async getList(id) {
    return runRequest(async () => {
      const response = await axiosClient.get(`/lists/${id}`)
      return getPayloadData(response)
    }, 'No se pudo cargar la lista.')
  },

  async updateList(id, payload) {
    return runRequest(async () => {
      const response = await axiosClient.patch(`/lists/${id}`, payload)
      return getPayloadData(response)
    }, 'No se pudo actualizar la lista.')
  },

  async deleteList(id) {
    return runRequest(async () => {
      const response = await axiosClient.delete(`/lists/${id}`)
      return getPayloadData(response)
    }, 'No se pudo eliminar la lista.')
  },

  async addItemToList(id, payload) {
    return runRequest(async () => {
      const response = await axiosClient.post(`/lists/${id}/items`, payload)
      return getPayloadData(response)
    }, 'No se pudo agregar el manga a la lista.')
  },

  async removeItemFromList(id, mangaId) {
    return runRequest(async () => {
      const response = await axiosClient.delete(`/lists/${id}/items/${mangaId}`)
      return getPayloadData(response)
    }, 'No se pudo quitar el manga de la lista.')
  },

  async reorderListItems(id, items) {
    return runRequest(async () => {
      const response = await axiosClient.patch(`/lists/${id}/items/reorder`, { items })
      return getPayloadData(response)
    }, 'No se pudo reordenar la lista.')
  },

  async getUserLists(username) {
    return runRequest(async () => {
      const response = await axiosClient.get(`/users/${username}/lists`)

      return {
        items: response.data?.data || [],
        meta: response.data?.meta || null,
      }
    }, 'No se pudieron cargar las listas públicas.')
  },

  async getUserList(username, listId) {
    return runRequest(async () => {
      const response = await axiosClient.get(`/users/${username}/lists/${listId}`)

      return {
        list: response.data?.data || null,
        meta: response.data?.meta || null,
      }
    }, 'No se pudo cargar la lista pública.')
  },
}

export default listService
