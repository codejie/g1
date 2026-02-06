import type { Request, Response, PaginationRequest } from './common'

export type OCMessage = {
  id: number
  user_id: number
  session_id: string
  message: string
  created: Date
}

// Create Message
export interface CreateMessageRequest extends Request {
  session_id: string
  message: string
}

export type CreateMessageResult = {
  message: OCMessage
}

export interface CreateMessageResponse extends Response {
  data: CreateMessageResult
}

// Get Message
export interface GetMessageRequest extends Request {
  id: number
}

export type GetMessageResult = {
  message: OCMessage
}

export interface GetMessageResponse extends Response {
  data: GetMessageResult
}

// List Messages
export interface ListMessagesRequest extends PaginationRequest {
  session_id?: string
}

export type ListMessagesResult = {
  messages: OCMessage[]
}

export interface ListMessagesResponse extends Response {
  data: ListMessagesResult
}

// Delete Message
export interface DeleteMessageRequest extends Request {
  id: number
}

export type DeleteMessageResult = {
  success: boolean
}

export interface DeleteMessageResponse extends Response {
  data: DeleteMessageResult
}
