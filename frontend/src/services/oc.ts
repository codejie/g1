import api, { BASE_URL } from './api'
import type {
  SessionCreateRequest,
  SessionMessageAsyncRequest,
  SessionSkillActiveRequest,
  SessionMessageQuestionRequest,
  SessionSSESubscribeRequest
} from '../types/oc'

const ocService = {
  // Session create
  createSession: async (data: SessionCreateRequest) => {
    return await api.post<any>('/oc/session/create', data)
  },

  // Session message async
  sendSessionMessage: async (data: SessionMessageAsyncRequest) => {
    return await api.post<any>('/oc/session/message/async', data)
  },

  // Session skill active
  skillActive: async (data: SessionSkillActiveRequest) => {
    return await api.post<any>('/oc/session/skill_active', data)
  },

  // Session message question
  questionReply: async (data: SessionMessageQuestionRequest) => {
    return await api.post<any>('/oc/session/tool/question', data)
  },

  // SSE subscribe
  getSSEUrl: (params: SessionSSESubscribeRequest): string => {
    const url = new URL(`${BASE_URL}/oc/session/sse`)
    url.searchParams.append('session_id', params.session_id.toString())
    return url.toString()
  }
}

export default ocService


