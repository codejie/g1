import api from './api'
import type {
  CreateSessionRequest,
  CreateSessionResult,
  GetSessionRequest,
  GetSessionResult,
  GetSessionsRequest,
  Session,
  UpdateSessionRequest,
  UpdateSessionResult,
  DeleteSessionRequest,
  DeleteSessionResult,
} from '../types/agent'
import type { ListResult } from '../types/common'

const agentService = {
  createSession: async (data: CreateSessionRequest): Promise<CreateSessionResult> => {
    return await api.post<CreateSessionResult>('/agent/create-session', data)
  },

  getSession: async (params: GetSessionRequest): Promise<GetSessionResult> => {
    return await api.post<GetSessionResult>('/agent/get-session', params)
  },

  getSessions: async (params?: GetSessionsRequest): Promise<ListResult<Session>> => {
    return await api.post<ListResult<Session>>('/agent/list-sessions', params)
  },

  updateSession: async (data: UpdateSessionRequest): Promise<UpdateSessionResult> => {
    return await api.post<UpdateSessionResult>('/agent/update-session', data)
  },

  deleteSession: async (params: DeleteSessionRequest): Promise<DeleteSessionResult> => {
    return await api.post<DeleteSessionResult>('/agent/delete-session', params)
  },
}

export default agentService
