import type { Request, Response } from './common'

export type OCSession = {
  id: number
  user_id: number
  session_id: string
  parent_id?: string
  directory: string
  title?: string
  disabled: number // 0: active, 1: disabled
  created: Date
  updated: Date
}

// Create OC Session
export interface CreateOCSessionRequest extends Request {
  parent_id?: string
  directory?: string
  title?: string
}

export type CreateOCSessionResult = {
  session: OCSession
}

export interface CreateOCSessionResponse extends Response {
  data: CreateOCSessionResult
}

// Get OC Session
export interface GetOCSessionRequest extends Request {
  // user_id will be extracted from JWT token
}

export type GetOCSessionResult = {
  session: OCSession
}

export interface GetOCSessionResponse extends Response {
  data: GetOCSessionResult
}