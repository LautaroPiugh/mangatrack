import axiosClient, { getApiErrorMessage } from '../api/axiosClient.js'

export const buildParams = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
)

export const getPayloadData = (response) => response.data?.data ?? null

export const getCollectionPayload = (response) => ({
  items: response.data?.data || [],
  meta: response.data?.meta || null,
})

export const normalizeRequestError = (error, fallbackMessage) => {
  const normalizedError = new Error(getApiErrorMessage(error, fallbackMessage))
  normalizedError.code = error.response?.data?.code || null
  normalizedError.status = error.response?.status || null
  normalizedError.details = Array.isArray(error.response?.data?.details)
    ? error.response.data.details
    : []

  return normalizedError
}

export const runRequest = async (requestFactory, fallbackMessage) => {
  try {
    return await requestFactory()
  } catch (error) {
    throw normalizeRequestError(error, fallbackMessage)
  }
}

export default axiosClient
