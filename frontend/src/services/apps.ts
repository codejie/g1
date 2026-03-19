import api from './api'
import type { CreateReqeust, GetInfoRequest, GetListRequest, AppsModelType } from '../types/apps'

const appsService = {
  create: async (data: CreateReqeust): Promise<AppsModelType> => {
    return await api.post<AppsModelType>('/apps/create', data)
  },

  getInfo: async (data: GetInfoRequest): Promise<AppsModelType> => {
    return await api.post<AppsModelType>('/apps/info', data)
  },

  getList: async (data?: GetListRequest): Promise<AppsModelType[]> => {
    return await api.post<AppsModelType[]>('/apps/list', data || {})
  }
}

export default appsService
