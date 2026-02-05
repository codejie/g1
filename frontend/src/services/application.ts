import api from './api'
import type {
  ApplicationListRequest,
  ApplicationListResult,
  CreateApplicationRequest,
  CreateApplicationResult,
  GetApplicationRequest,
  GetApplicationResult,
  UpdateApplicationRequest,
  UpdateApplicationResult,
  DeleteApplicationRequest,
  DeleteApplicationResult,
  FileUploadRequest,
  FileUploadResult,
  FileDownloadRequest,
  FileDownloadResult,
  GetApplicationFilesRequest,
  GetApplicationFilesResult,
  DeleteFileRequest,
  DeleteFileResult,
} from '../types/application'

const applicationService = {
  getApplicationList: async (params?: ApplicationListRequest): Promise<ApplicationListResult> => {
    return await api.post<ApplicationListResult>('/application/list', params)
  },

  createApplication: async (data: CreateApplicationRequest): Promise<CreateApplicationResult> => {
    return await api.post<CreateApplicationResult>('/application/create', data)
  },

  getApplication: async (params: GetApplicationRequest): Promise<GetApplicationResult> => {
    return await api.post<GetApplicationResult>('/application/get', params)
  },

  updateApplication: async (data: UpdateApplicationRequest): Promise<UpdateApplicationResult> => {
    return await api.post<UpdateApplicationResult>('/application/update', data)
  },

  deleteApplication: async (params: DeleteApplicationRequest): Promise<DeleteApplicationResult> => {
    return await api.post<DeleteApplicationResult>('/application/delete', params)
  },

  // File related APIs
  uploadFile: async (data: FileUploadRequest): Promise<FileUploadResult> => {
    const formData = new FormData()
    formData.append('application_id', data.application_id.toString())
    formData.append('file', data.file)
    
    return await api.post<FileUploadResult>('/application/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  downloadFile: async (params: FileDownloadRequest): Promise<FileDownloadResult> => {
    return await api.post<FileDownloadResult>('/application/download-file', params)
  },

  getApplicationFiles: async (params: GetApplicationFilesRequest): Promise<GetApplicationFilesResult> => {
    return await api.post<GetApplicationFilesResult>('/application/get-files', params)
  },

  deleteFile: async (params: DeleteFileRequest): Promise<DeleteFileResult> => {
    return await api.post<DeleteFileResult>('/application/delete-file', params)
  },
}

export default applicationService
