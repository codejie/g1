import api from './api'
import type {
  LoginRequest,
  LoginResult,
  RegisterRequest,
  RegisterResult,
  LogoutRequest,
  LogoutResult,
  ProfileRequest,
  ProfileResult,
} from '../types/user'

// User API Service - Basic Authentication Functions
const userService = {
  // User Authentication
  login: async (credentials: LoginRequest): Promise<LoginResult> => {
    return await api.post<LoginResult>('/user/login', credentials)
  },

  register: async (userData: RegisterRequest): Promise<RegisterResult> => {
    return await api.post<RegisterResult>('/user/register', userData)
  },

  logout: async (logoutData?: LogoutRequest): Promise<LogoutResult> => {
    return await api.post<LogoutResult>('/user/logout', logoutData)
  },

  // User Profile Management
  getProfile: async (): Promise<ProfileResult> => {
    return await api.post<ProfileResult>('/user/profile')
  },

  updateProfile: async (
    profileData: ProfileRequest,
  ): Promise<ProfileResult> => {
    return await api.post<ProfileResult>('/user/set-profile', profileData)
  },
}

export default userService
