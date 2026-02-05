import api from './api'
import type {
  StudioListRequest,
  StudioListResult,
  CreateStudioRequest,
  CreateStudioResult,
  UpdateStudioRequest,
  UpdateStudioResult,
  DeleteStudioRequest,
  DeleteStudioResult,
  StudioMembersRequest,
  StudioMembersResult,
  AddStudioMemberRequest,
  AddStudioMemberResult,
  RemoveStudioMemberRequest,
  RemoveStudioMemberResult,
  UpdateStudioMemberRequest,
  UpdateStudioMemberResult,
} from '../types/studio'

const studioService = {
  getStudioList: async (params?: StudioListRequest): Promise<StudioListResult> => {
    return await api.post<StudioListResult>('/studio/list', params)
  },

  createStudio: async (data: CreateStudioRequest): Promise<CreateStudioResult> => {
    return await api.post<CreateStudioResult>('/studio/create', data)
  },

  updateStudio: async (data: UpdateStudioRequest): Promise<UpdateStudioResult> => {
    return await api.post<UpdateStudioResult>('/studio/update', data)
  },

  deleteStudio: async (data: DeleteStudioRequest): Promise<DeleteStudioResult> => {
    return await api.post<DeleteStudioResult>('/studio/delete', data)
  },

  getStudioMembers: async (params: StudioMembersRequest): Promise<StudioMembersResult> => {
    return await api.post<StudioMembersResult>('/studio/members', params)
  },

  addStudioMember: async (data: AddStudioMemberRequest): Promise<AddStudioMemberResult> => {
    return await api.post<AddStudioMemberResult>('/studio/add-member', data)
  },

  removeStudioMember: async (data: RemoveStudioMemberRequest): Promise<RemoveStudioMemberResult> => {
    return await api.post<RemoveStudioMemberResult>('/studio/remove-member', data)
  },

  updateStudioMember: async (data: UpdateStudioMemberRequest): Promise<UpdateStudioMemberResult> => {
    return await api.post<UpdateStudioMemberResult>('/studio/update-member', data)
  },
}

export default studioService
