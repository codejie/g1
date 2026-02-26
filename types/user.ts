import type { Request, Response, PaginationRequest } from './common.js'

export type User = {
  id: number
  username: string
  email: string
  password?: string // Password is not always returned
  disabled: number // 0: enabled, 1: disabled
  created: Date
  updated: Date
}

export type UserStudio = {
  id: number
  user_id: number
  studio_id: number
  role: string
  is_default: boolean
  is_owner: boolean
  created: Date
  updated: Date
}

export type UserToken = {
  id: number
  user_id: number
  token: string
  expires: Date
  disabled: number // 0: active, 1: disabled
  created: Date
  updated: Date
}

// Login
export interface LoginRequest extends Request {
  email: string
  password: string
}

export type LoginResult = {
  token: string
  user: User
}

export interface LoginResponse extends Response {
  data: LoginResult
}

// Logout
export interface LogoutRequest extends Request {
  token?: string // optional, if not provided, logout current token
}

export type LogoutResult = {
  message: string
}

export interface LogoutResponse extends Response {
  data: LogoutResult
}

// Register
export interface RegisterRequest extends Request {
  username: string
  email: string
  password: string
  name?: string // Optional field for backwards compatibility
}

export type RegisterResult = {
  user: User
}

export interface RegisterResponse extends Response {
  data: RegisterResult
}

// Profile Management
export interface ProfileRequest extends Request {
  username?: string
  email?: string
  name?: string
}

export type ProfileResult = {
  user: User
}

export interface ProfileResponse extends Response {
  data: ProfileResult
}

export interface SetProfileRequest extends Request {
  [key: string]: any // Allow setting any profile field
}

export interface SetProfileResponse extends Response {
  data: ProfileResult
}

// Password Reset
export interface ResetPasswordRequest extends Request {
  email: string
  newPassword?: string // For reset flow
  currentPassword?: string // For password change
}

export type ResetPasswordResult = {
  message: string
}

export interface ResetPasswordResponse extends Response {
  data: ResetPasswordResult
}

// Token Management
export interface TokensRequest extends Request {
  page_info?: {
    page?: number
    size?: number
  }
}

export type TokensResult = {
  items: UserToken[]
  page_info: {
    page: number
    size: number
    total: number
  }
}

export interface TokensResponse extends Response {
  data: TokensResult
}

export interface RevokeTokenRequest extends Request {
  token: string
}

export type RevokeTokenResult = {
  message: string
}

export interface RevokeTokenResponse extends Response {
  data: RevokeTokenResult
}

// Studio Management
export interface UserStudiosRequest extends Request {
  page_info?: {
    page?: number
    size?: number
  }
}

export type UserStudiosResult = {
  items: (UserStudio & { studio_name: string })[]
  page_info: {
    page: number
    size: number
    total: number
  }
}

export interface UserStudiosResponse extends Response {
  data: UserStudiosResult
}

export interface SwitchStudioRequest extends Request {
  studio_id: number
}

export type SwitchStudioResult = {
  message: string
}

export interface SwitchStudioResponse extends Response {
  data: SwitchStudioResult
}

export interface DeleteStudioRequest extends Request {
  studio_id: number
}

export type DeleteStudioResult = {
  message: string
}

export interface DeleteStudioResponse extends Response {
  data: DeleteStudioResult
}

export interface CreateStudioRequest extends Request {
  name: string
  description?: string
}

export type CreateStudioResult = {
  studio: {
    id: number
    name: string
    description?: string
  }
  userStudio: UserStudio
}

export interface CreateStudioResponse extends Response {
  data: CreateStudioResult
}

// Get Single User
export interface GetUserRequest extends Request {
  id: number
}

export type GetUserResult = {
  user: User
}

export interface GetUserResponse extends Response {
  data: GetUserResult
}

// Get Multiple Users
export interface GetUsersRequest extends PaginationRequest {}

export interface GetUsersResponse extends Response {
  data: {
    items: User[]
    page_info: {
      page: number
      size: number
      total: number
    }
  }
}

// Update User
export interface UpdateUserRequest extends Request {
  id: number
  username?: string
  email?: string
  password?: string
  name?: string // For backwards compatibility
  disabled?: number
}

export type UpdateUserResult = {
  user: User
}

export interface UpdateUserResponse extends Response {
  data: UpdateUserResult
}

// Delete User
export interface DeleteUserRequest extends Request {
  id: number
}

export type DeleteUserResult = {
  message: string
}

export interface DeleteUserResponse extends Response {
  data: DeleteUserResult
}