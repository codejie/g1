import type { Request, Response, PaginationRequest } from './common'

export type Application = {
  id: number
  user_id: number
  type: string
  name: string
  description?: string
  icon?: string
  status: string // 'processing', 'completed', 'active', 'inactive'
  disabled: number // 0: enabled, 1: disabled
  created: Date
  updated: Date
}

export type AppFile = {
  id: number
  user_id: number
  application_id: number
  name: string
  path: string
  size: bigint
  type: string // MIME type
  disabled: number // 0: enabled, 1: disabled
  created: Date
  updated: Date
}

// Application List
export interface ApplicationListRequest extends PaginationRequest {
  filter?: {
    type?: string
    status?: string
    disabled?: number
  }
}

export type ApplicationListResult = {
  items: Application[]
  page_info: {
    page: number
    size: number
    total: number
  }
}

export interface ApplicationListResponse extends Response {
  data: ApplicationListResult
}

// Create Application
export interface CreateApplicationRequest extends Request {
  type: string
  name: string
  description?: string
  icon?: string
  status?: string // Default: 'processing'
}

export type CreateApplicationResult = {
  application: Application
}

export interface CreateApplicationResponse extends Response {
  data: CreateApplicationResult
}

// Get Application
export interface GetApplicationRequest extends Request {
  id: number
}

export type GetApplicationResult = {
  application: Application
}

export interface GetApplicationResponse extends Response {
  data: GetApplicationResult
}

// Update Application
export interface UpdateApplicationRequest extends Request {
  id: number
  type?: string
  name?: string
  description?: string
  icon?: string
  status?: string
  disabled?: number
}

export type UpdateApplicationResult = {
  application: Application
}

export interface UpdateApplicationResponse extends Response {
  data: UpdateApplicationResult
}

// Delete Application
export interface DeleteApplicationRequest extends Request {
  id: number
}

export type DeleteApplicationResult = {
  message: string
}

export interface DeleteApplicationResponse extends Response {
  data: DeleteApplicationResult
}

// File Upload
export interface FileUploadRequest extends Request {
  application_id: number
  file: File // multipart file
}

export type FileUploadResult = {
  file: AppFile
}

export interface FileUploadResponse extends Response {
  data: FileUploadResult
}

// File Download
export interface FileDownloadRequest extends Request {
  file_id: number
}

export type FileDownloadResult = {
  file: {
    id: number
    name: string
    path: string
    size: bigint
    type: string
  }
  buffer: Buffer
}

export interface FileDownloadResponse extends Response {
  data: FileDownloadResult
}

// Get Application Files
export interface GetApplicationFilesRequest extends Request {
  application_id: number
  page_info?: {
    page?: number
    size?: number
  }
}

export type GetApplicationFilesResult = {
  items: AppFile[]
  page_info: {
    page: number
    size: number
    total: number
  }
}

export interface GetApplicationFilesResponse extends Response {
  data: GetApplicationFilesResult
}

// Delete File
export interface DeleteFileRequest extends Request {
  file_id: number
}

export type DeleteFileResult = {
  message: string
}

export interface DeleteFileResponse extends Response {
  data: DeleteFileResult
}