import type { Request, Response, PaginationRequest } from './common'

export type Session = {
  id: string
  parentId?: string
  directory: string
  title?: string
  created: Date
  updated: Date
}

// Create Session
export interface CreateSessionRequest extends Request {
  parentId?: string
  title?: string
}

export type CreateSessionResult = {
  session: Session
}

export interface CreateSessionResponse extends Response {
  data: CreateSessionResult
}

// Get Single Session
export interface GetSessionRequest extends Request {
  id: string
}

export type GetSessionResult = {
  session: Session
}

export interface GetSessionResponse extends Response {
  data: GetSessionResult
}

// Get Multiple Sessions
export interface GetSessionsRequest extends PaginationRequest {}

export interface GetSessionsResponse extends Response {
  data: {
    items: Session[]
    page_info: {
      page: number
      size: number
      total: number
    }
  }
}

// Update Session
export interface UpdateSessionRequest extends Request {
  id: string
  parentId?: string
  directory?: string
  title?: string
}

export type UpdateSessionResult = {
  session: Session
}

export interface UpdateSessionResponse extends Response {
  data: UpdateSessionResult
}

// Delete Session
export interface DeleteSessionRequest extends Request {
  id: string
}

export type DeleteSessionResult = {
  message: string
}

export interface DeleteSessionResponse extends Response {
  data: DeleteSessionResult
}
