import api from './api'
import type {
  CreateOCSessionRequest,
  CreateOCSessionResult,
  GetOCSessionResult,
} from '../types/oc'

const ocService = {
  createSession: async (data: CreateOCSessionRequest): Promise<CreateOCSessionResult> => {
    return await api.post<CreateOCSessionResult>('/oc/create-session', data)
  },

  getSession: async (): Promise<GetOCSessionResult> => {
    return await api.post<GetOCSessionResult>('/oc/get-session')
  },
}

export default ocService
