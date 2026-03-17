// src/lib/api.js
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../context/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000,  // 2 min for image processing
})

// ─── Request interceptor — attach JWT ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Response interceptor — handle 401 globally ──────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || 'Something went wrong'

    if (status === 401) {
      useAuthStore.getState().logout()
      toast.error('Session expired. Please log in again.')
    } else if (status === 402) {
      toast.error(message, { duration: 6000 })
    } else if (status >= 500) {
      toast.error('Server error. Please try again.')
    }

    return Promise.reject(error)
  }
)

// ─── API helpers ──────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
}

export const imageApi = {
  upload:      (formData, onProgress) => api.post('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
  }),
  uploadBulk:  (formData, onProgress) => api.post('/images/upload-bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
  }),
  list:        (page = 1, limit = 20) => api.get(`/images?page=${page}&limit=${limit}`),
  get:         (id)  => api.get(`/images/${id}`),
  downloadZip: (id)  => api.get(`/images/${id}/download`, { responseType: 'blob' }),
  delete:      (id)  => api.delete(`/images/${id}`),
}

export const paymentApi = {
  plans:    ()     => api.get('/payment/plans'),
  initiate: (plan) => api.post('/payment/initiate', { plan }),
  verify:   (data) => api.post('/payment/verify', data),
  history:  ()     => api.get('/payment/history'),
}

export const userApi = {
  profile:        ()     => api.get('/user/profile'),
  updateProfile:  (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/change-password', data),
  dashboard:      ()     => api.get('/user/dashboard'),
}

export default api
