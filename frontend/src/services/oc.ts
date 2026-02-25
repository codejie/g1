import api, { BASE_URL } from './api'
import type {
  CreateOCSessionRequest,
  OCSessionResponse,
  UpdateOCSessionRequest,
  SendSessionMessageRequest,
  SessionMessageResponse,
  SkillsCallbackRequest,
  SkillsCallbackResponse,
  QuestionReplyRequest,
  QuestionReplyResponse,
  SSERequest
} from '../types/oc'

const ocService = {
  createSession: async (data: CreateOCSessionRequest): Promise<OCSessionResponse> => {
    return await api.post<OCSessionResponse>('/oc/session/create', data)
  },

  updateSession: async (data: UpdateOCSessionRequest): Promise<OCSessionResponse> => {
    return await api.post<OCSessionResponse>('/oc/session/update', data)
  },

  sendSessionMessage: async (data: SendSessionMessageRequest): Promise<SessionMessageResponse> => {
    return await api.post<SessionMessageResponse>('/oc/session/message', data)
  },

  skillsCallback: async (data: SkillsCallbackRequest): Promise<SkillsCallbackResponse> => {
    return await api.post<SkillsCallbackResponse>('/oc/skills/callback', data)
  },

  questionReply: async (data: QuestionReplyRequest): Promise<QuestionReplyResponse> => {
    return await api.post<QuestionReplyResponse>('/oc/session/question_reply', data)
  },

  getSSEUrl: (params: SSERequest): string => {
    // BASE_URL is 'http://localhost:3000/api'
    // Paths in api.post are like '/oc/session/create'
    // So for SSE we want BASE_URL + '/oc/session/sse'
    const url = new URL(`${BASE_URL}/oc/session/sse`)
    url.searchParams.append('session_id', params.session_id.toString())
    return url.toString()
  }
}

export default ocService

