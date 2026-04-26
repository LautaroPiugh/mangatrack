import axiosClient, { getApiErrorMessage } from '../api/axiosClient.js'

export const buildParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
)

export const getPayloadData = (response) => response.data?.data ?? null

export const getCollectionPayload = (response) => ({
  items: response.data?.data || [],
  meta: response.data?.meta || null,
})

export const normalizeRequestError = (error, fallbackMessage) => (
  new Error(getApiErrorMessage(error, fallbackMessage))
)

export const runRequest = async (requestFactory, fallbackMessage) => {
  try {
    return await requestFactory()
  } catch (error) {
    throw normalizeRequestError(error, fallbackMessage)
  }
}

export default axiosClient
