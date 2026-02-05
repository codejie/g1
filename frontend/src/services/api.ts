import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import type { Response } from '../types/common' // Import the Response type

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Added /api prefix
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  // Bypass token for login and register routes
  if (config.url !== '/user/login' && config.url !== '/user/register') {
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    // Assume all successful responses from backend have a 'code' field
    const res = response.data as Response
    if (res.code === 0) {
      // If code is 0, it's a success, return the actual data
      return res.data
    } else {
      console.error('API error:', res)
      // If code is not 0, it's a business error
      // Create an Error object with the message from the backend
      const error = new Error(res.message || 'Unknown API error')
      // Attach the original response for more details if needed
      ;(error as any).response = response
      return Promise.reject(error)
    }
  },
  (error) => {
    // Handle HTTP errors (e.g., 404, 500)
    // If the error has a response from the server, extract its message
    if (error.response && error.response.data && error.response.data.message) {
      const apiError = new Error(error.response.data.message)
      ;(apiError as any).response = error.response
      return Promise.reject(apiError)
    }
    // For network errors or other uncaught errors
    return Promise.reject(error)
  },
)

// Typed request wrapper
const request = {
  get: <T = any>(url: string, config?: any): Promise<T> => api.get(url, config) as any,
  post: <T = any>(url: string, data?: any, config?: any): Promise<T> => api.post(url, data, config) as any,
  put: <T = any>(url: string, data?: any, config?: any): Promise<T> => api.put(url, data, config) as any,
  delete: <T = any>(url: string, config?: any): Promise<T> => api.delete(url, config) as any,
  patch: <T = any>(url: string, data?: any, config?: any): Promise<T> => api.patch(url, data, config) as any,
}

export default request
