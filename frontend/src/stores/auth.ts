import { defineStore } from 'pinia'
import api from '../services/api'
import router from '../router'
import {
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
  type User,
} from '../types/user' // Updated import path

interface AuthState {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
  },
  actions: {
    setAuth(token: string, user: User) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    clearAuth() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    async login(credentials: LoginRequest) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post<LoginResponse>(
          '/user/login',
          credentials,
        )
        if (response.data.data.token && response.data.data.user) {
          this.setAuth(response.data.data.token, response.data.data.user)
          router.push('/')
        }
      } catch (err: any) {
        this.error = err.response?.data?.error?.message || 'Login failed'
        console.error('Login error:', err)
        this.clearAuth()
      } finally {
        this.loading = false
      }
    },

    async register(userData: RegisterRequest) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post<RegisterResponse>(
          '/user/register',
          userData,
        )
        if (response.data.data.user) {
          router.push('/login')
        }
      } catch (err: any) {
        this.error = err.response?.data?.error?.message || 'Registration failed'
        console.error('Register error:', err)
        this.clearAuth()
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.clearAuth()
      router.push('/login')
    },
  },
})
