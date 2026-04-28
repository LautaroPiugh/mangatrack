import axiosClient from '../api/axiosClient.js'
import { getCollectionPayload, getPayloadData, runRequest } from './http.js'

const profileService = {
  async getPublicProfile(username) {
    return runRequest(async () => {
      const response = await axiosClient.get(`/users/${username}/public`)
      return getPayloadData(response)
    }, 'No se pudo cargar el perfil público.')
  },

  async updateMyProfile(payload) {
    return runRequest(async () => {
      const response = await axiosClient.patch('/users/me/profile', payload)
      return getPayloadData(response)
    }, 'No se pudo actualizar el perfil.')
  },

  async followUser(userId) {
    return runRequest(async () => {
      const response = await axiosClient.post(`/users/${userId}/follow`)
      return getPayloadData(response)
    }, 'No se pudo seguir al usuario.')
  },

  async unfollowUser(userId) {
    return runRequest(async () => {
      const response = await axiosClient.delete(`/users/${userId}/unfollow`)
      return getPayloadData(response)
    }, 'No se pudo dejar de seguir al usuario.')
  },

  async getFollowers(userId) {
    return runRequest(async () => {
      const response = await axiosClient.get(`/users/${userId}/followers`)
      return getCollectionPayload(response)
    }, 'No se pudieron cargar los seguidores.')
  },

  async getFollowing(userId) {
    return runRequest(async () => {
      const response = await axiosClient.get(`/users/${userId}/following`)
      return getCollectionPayload(response)
    }, 'No se pudieron cargar los usuarios seguidos.')
  },
}

export default profileService
