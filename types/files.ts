import { PageInfo, Request, Response } from './common'

export interface FileItem {
    path: string
    name: string
    type: string // "directory" or mime-type/extension
    size: number
    created: string
    updated: string
}

export interface FileListRequest extends Request {
    path: string
    filter?: {
        name?: string
        type?: string
        size?: number
        created?: string
    }
    page_info: PageInfo
}

export interface FileListResult extends Response {
    data: {
        items: FileItem[]
        page_info: PageInfo
    }
}

export interface FileDownloadRequest extends Request {
    path: string
    name?: string
}

export interface FileDownloadResult extends Response {
    // Should be stream, but maybe return download URL or metadata?
    // Usually download returns binary stream directly.
    data?: any
}

export interface FileUploadRequest extends Request {
    path: string // target directory
    // file is handled via multipart
    description?: string
}

export interface FileUploadResponse extends Response {
    data: FileItem
}
