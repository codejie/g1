import type { Request, Response, PaginationRequest } from './common'

export type User = {
  id: string
  email: string
  password?: string // Password is not always returned
  name: string
  status: number // 0: active, 1: inactive
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

// Register
export interface RegisterRequest extends Request {
  email: string
  password: string
  name: string
}
export type RegisterResult = {
  user: User
}
export interface RegisterResponse extends Response {
  data: RegisterResult
}

// Get Single User
export interface GetUserRequest extends Request {
  id: string
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
  id: string
  name?: string
  email?: string
  password?: string
  status?: number
}
export type UpdateUserResult = {
  user: User
}
export interface UpdateUserResponse extends Response {
  data: UpdateUserResult
}

// Delete User
export interface DeleteUserRequest extends Request {
  id: string
}
export type DeleteUserResult = {
  message: string
}
export interface DeleteUserResponse extends Response {
  data: DeleteUserResult
}
