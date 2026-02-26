import type { Request, Response, PaginationRequest } from './common.js'

export type Studio = {
  id: number
  name: string
  description?: string
  disabled: number // 0: enabled, 1: disabled
  created: Date
  updated: Date
}

export type StudioMember = {
  id: number
  user_id: number
  studio_id: number
  role: string
  is_default: boolean
  is_owner: boolean
  created: Date
  updated: Date
  username: string
  email: string
}

// Studio List
export interface StudioListRequest extends PaginationRequest {
  filter?: {
    name?: string
    disabled?: number
  }
}

export type StudioListResult = {
  items: Studio[]
  page_info: {
    page: number
    size: number
    total: number
  }
}

export interface StudioListResponse extends Response {
  data: StudioListResult
}

// Create Studio
export interface CreateStudioRequest extends Request {
  name: string
  description?: string
}

export type CreateStudioResult = {
  studio: Studio
}

export interface CreateStudioResponse extends Response {
  data: CreateStudioResult
}

// Update Studio
export interface UpdateStudioRequest extends Request {
  id: number
  name?: string
  description?: string
  disabled?: number
}

export type UpdateStudioResult = {
  studio: Studio
}

export interface UpdateStudioResponse extends Response {
  data: UpdateStudioResult
}

// Delete Studio
export interface DeleteStudioRequest extends Request {
  id: number
}

export type DeleteStudioResult = {
  message: string
}

export interface DeleteStudioResponse extends Response {
  data: DeleteStudioResult
}

// Get Studio Members
export interface StudioMembersRequest extends Request {
  studio_id: number
  page_info?: {
    page?: number
    size?: number
  }
}

export type StudioMembersResult = {
  items: StudioMember[]
  page_info: {
    page: number
    size: number
    total: number
  }
}

export interface StudioMembersResponse extends Response {
  data: StudioMembersResult
}

// Add Studio Member
export interface AddStudioMemberRequest extends Request {
  studio_id: number
  user_email: string
  role?: string // Default: 'member'
  is_owner?: boolean // Default: false
}

export type AddStudioMemberResult = {
  member: StudioMember
}

export interface AddStudioMemberResponse extends Response {
  data: AddStudioMemberResult
}

// Remove Studio Member
export interface RemoveStudioMemberRequest extends Request {
  studio_id: number
  user_id: number
}

export type RemoveStudioMemberResult = {
  message: string
}

export interface RemoveStudioMemberResponse extends Response {
  data: RemoveStudioMemberResult
}

// Update Studio Member Role
export interface UpdateStudioMemberRequest extends Request {
  studio_id: number
  user_id: number
  role?: string
  is_owner?: boolean
}

export type UpdateStudioMemberResult = {
  member: StudioMember
}

export interface UpdateStudioMemberResponse extends Response {
  data: UpdateStudioMemberResult
}