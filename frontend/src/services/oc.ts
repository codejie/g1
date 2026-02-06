import api from './api'
import type { CreateOCSessionRequest, OCSessionResponse, SendSessionMessageRequest, SessionMessageResponse } from '../types/oc'

const ocService = {
  createSession: async (data: CreateOCSessionRequest): Promise<OCSessionResponse> => {
    return await api.post<OCSessionResponse>('/oc/session/create', data)
  },

  sendSessionMessage: async (data: SendSessionMessageRequest): Promise<SessionMessageResponse> => {
    return await api.post<SessionMessageResponse>('/oc/session/message', data)
  }
}

export default ocService
