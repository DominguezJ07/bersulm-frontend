import axios from 'axios'

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function getAuthToken(): string | null {
  return authToken
}

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

api.interceptors.request.use(
  (config) => {
    if (authToken && config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

const AUTH_ENDPOINTS_NO_REDIRECT = ['/auth/login', '/auth/register']

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl: string = error?.config?.url || ''
    const isAuthEndpoint = AUTH_ENDPOINTS_NO_REDIRECT.some((path) =>
      requestUrl.includes(path)
    )

    if (error?.response?.status === 401 && !isAuthEndpoint) {
      authToken = null
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
