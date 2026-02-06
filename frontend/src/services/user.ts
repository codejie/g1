import api from './api'
import type {
  LoginRequest,
  LoginResult,
  RegisterRequest,
  RegisterResult,
  LogoutRequest,
  LogoutResult,
  ProfileResult,
  SetProfileRequest,
  TokensRequest,
  TokensResult,
  RevokeTokenRequest,
  RevokeTokenResult,
  ResetPasswordRequest,
  ResetPasswordResult,
  CreateStudioRequest,
  CreateStudioResult,
  UserStudiosRequest,
  UserStudiosResult,
  SwitchStudioRequest,
  SwitchStudioResult,
  DeleteStudioRequest,
  DeleteStudioResult,
  GetUserRequest,
  GetUserResult,
  GetUsersRequest,
  GetUsersResponse, // GetUsersResponse contains ListResult<User> indirectly
  UpdateUserRequest,
  UpdateUserResult,
  DeleteUserRequest,
  DeleteUserResult,
} from '../types/user'

// User API Service
const userService = {
  login: async (credentials: LoginRequest): Promise<LoginResult> => {
    return await api.post<LoginResult>('/user/login', credentials)
  },

  register: async (userData: RegisterRequest): Promise<RegisterResult> => {
    return await api.post<RegisterResult>('/user/register', userData)
  },

  logout: async (logoutData?: LogoutRequest): Promise<LogoutResult> => {
    return await api.post<LogoutResult>('/user/logout', logoutData)
  },

  deleteUser: async (
    deleteData: DeleteUserRequest,
  ): Promise<DeleteUserResult> => {
    return await api.post<DeleteUserResult>('/user/delete', deleteData)
  },

  getProfile: async (): Promise<ProfileResult> => {
    // Note: getProfile is typically a GET request, but modules.md specified it as API route without method.
    // Assuming POST for consistency with other user API calls.
    return await api.post<ProfileResult>('/user/profile')
  },

  setProfile: async (
    profileData: SetProfileRequest,
  ): Promise<ProfileResult> => {
    return await api.post<ProfileResult>('/user/set-profile', profileData)
  },

  getTokens: async (tokensData?: TokensRequest): Promise<TokensResult> => {
    return await api.post<TokensResult>('/user/tokens', tokensData)
  },

  revokeToken: async (
    revokeData: RevokeTokenRequest,
  ): Promise<RevokeTokenResult> => {
    return await api.post<RevokeTokenResult>('/user/revoke-token', revokeData)
  },

  resetPassword: async (
    passwordData: ResetPasswordRequest,
  ): Promise<ResetPasswordResult> => {
    return await api.post<ResetPasswordResult>(
      '/user/reset-password',
      passwordData,
    )
  },

  // Studio related APIs (User module responsibility)
  getStudios: async (
    studiosData?: UserStudiosRequest,
  ): Promise<UserStudiosResult> => {
    return await api.post<UserStudiosResult>('/user/studios', studiosData)
  },

  switchStudio: async (
    switchData: SwitchStudioRequest,
  ): Promise<SwitchStudioResult> => {
    return await api.post<SwitchStudioResult>('/user/switch-studio', switchData)
  },

  deleteUserStudio: async (
    deleteData: DeleteStudioRequest,
  ): Promise<DeleteStudioResult> => {
    return await api.post<DeleteStudioResult>('/user/delete-studio', deleteData)
  },

  createUserStudio: async (
    studioData: CreateStudioRequest,
  ): Promise<CreateStudioResult> => {
    return await api.post<CreateStudioResult>('/user/create-studio', studioData)
  },

  getUserList: async (
    usersData?: GetUsersRequest,
  ): Promise<GetUsersResponse> => {
    return await api.post<GetUsersResponse>('/user/list', usersData)
  },

  updateUser: async (
    userData: UpdateUserRequest,
  ): Promise<UpdateUserResult> => {
    return await api.post<UpdateUserResult>('/user/update', userData)
  },

  getUser: async (userData: GetUserRequest): Promise<GetUserResult> => {
    return await api.post<GetUserResult>('/user/get', userData)
  },
}

export default userService
