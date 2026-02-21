import api from './api'
import type {
    FileListRequest,
    FileListResult,
    FileDownloadRequest,
    FileUploadResult
} from '@/types/files'

export const listFiles = (data: FileListRequest): Promise<FileListResult> => {
    return api.post<FileListResult>('/files/list', data)
}

export const downloadFile = (data: FileDownloadRequest): Promise<Blob> => {
    return api.post<any>('/files/download', data, { responseType: 'blob' })
}

export const uploadFile = (data: FormData): Promise<FileUploadResult> => {
    return api.post<FileUploadResult>('/files/upload', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export default {
    listFiles,
    downloadFile,
    uploadFile
}
