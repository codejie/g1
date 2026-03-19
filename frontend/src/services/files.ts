import api from './api'
import type { DownloadRequest, GetInfoRequest, UploadReqeust, FilesModelType } from '../types/files'

const filesService = {
    /**
     * Request download metadata and stream from backend. Returns a blob that should be saved by caller.
     */
    download: async (data: DownloadRequest): Promise<Blob> => {
        // specify responseType blob so interceptor bypasses normal response processing
        return await api.post<Blob>('/files/download', data, { responseType: 'blob' })
    },

    /**
     * convenience helper that triggers browser download using returned blob
     */
    downloadAndSave: async (data: DownloadRequest, filename: string) => {
        const blob = await filesService.download(data)
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
    },

    /**
     * Get file information
     */
    getFileInfo: async (data: GetInfoRequest): Promise<FilesModelType> => {
        return await api.post<FilesModelType>('/files/info', data)
    },

    /**
     * Upload file content
     */
    upload: async (data: UploadReqeust): Promise<FilesModelType> => {
        return await api.post<FilesModelType>('/files/upload', data)
    }
}

export default filesService
