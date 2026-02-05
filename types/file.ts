import type { Request, Response } from './common'

export type File = {
  id: string
  fileName: string
  filePath: string
  size: number
  mimetype: string
  created: Date
  updated: Date
}

export interface UploadRequest extends Request {
  file: any // FastifyMultipartFile type is complex, use 'any' for simplicity
}

export type UploadResult = {
  fileName: string
  filePath: string
  size: number
  mimetype: string
}

export interface UploadResponse extends Response {
  data: UploadResult
}

export interface DownloadRequest extends Request {
  fileName: string
}

export type DownloadResult = {
  filePath: string
}

export interface DownloadResponse extends Response {
  data: DownloadResult // For a successful response, maybe just a success message or the file stream itself handled by Fastify
}
