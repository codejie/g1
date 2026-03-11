import type { BaseRequest, BaseResponse, PaginationRequest } from './common.js'

export type User = {
  id?: number
  username: string
  email: string
  password?: string // Password is not always returned
  disabled: number // 0: enabled, 1: disabled
  created: Date
  updated: Date
}

export type UserToken = {
  id?: number
  user_id: number // Foreign key of User
  token: string
  expires: Date
  disabled: number // 0: active, 1: disabled
  created: Date
  updated: Date
}

// Login
export interface LoginRequest extends BaseRequest {
  email: string
  password: string
}

export type LoginResult = {
  token: string
  user: User
}

export interface LoginResponse extends BaseResponse<LoginResult> { }

// Logout
export interface LogoutRequest extends BaseRequest { }

export type LogoutResult = {
  message: string
}

export interface LogoutResponse extends BaseResponse<LogoutResult> { }

// Register
export interface RegisterRequest extends BaseRequest {
  username: string
  email: string
  password: string
  name?: string // Optional field for backwards compatibility
}

export type RegisterResult = {
  user: User
}

export interface RegisterResponse extends BaseResponse<RegisterResult> { }

// Profile Management
export interface ProfileRequest extends BaseRequest {
  username?: string
  email?: string
  name?: string
}

export type ProfileResult = {
  user: User
}

export interface ProfileResponse extends BaseResponse<ProfileResult> { }