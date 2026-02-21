import { FastifyRequest, FastifyReply } from 'fastify';
import { 
    GetUserRequest, GetUserResponse,
    GetUsersRequest, GetUsersResponse,
    LoginRequest, LoginResponse,
    LogoutRequest, LogoutResponse,
    RegisterRequest, RegisterResponse,
    UpdateUserRequest, UpdateUserResponse,
    DeleteUserRequest, DeleteUserResponse,
    ProfileRequest, ProfileResponse, SetProfileResponse,
    ResetPasswordRequest, ResetPasswordResponse,
    TokensRequest, TokensResponse, RevokeTokenRequest, RevokeTokenResponse,
    UserStudiosRequest, UserStudiosResponse, SwitchStudioRequest, SwitchStudioResponse,
    DeleteStudioRequest, DeleteStudioResponse, CreateStudioRequest, CreateStudioResponse
} from '../../types/user';
import { RESPONSE_CODES } from '../../types/common';
import { UserModel, UserStudioModel, UserTokenModel } from './model';
import { StudioModel } from '../studio/model';
import { sendSuccess, sendError } from '../../utils/response';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config';

export const login = async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
    const { email, password } = request.body;

    const user = await UserModel.findByEmail(email);

    if (!user || !user.password) {
        return sendError(reply, RESPONSE_CODES.USER_NOT_FOUND, 'Login failed: User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return sendError(reply, RESPONSE_CODES.INVALID_PASSWORD, 'Login failed: Incorrect password');
    }

    const token = jwt.sign({ 
        id: user.id, 
        username: user.username, 
        email: user.email 
    }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

    await UserTokenModel.create({
        user_id: user.id,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        disabled: 0
    });
    
    return sendSuccess(reply, {
        token,
        user: { ...user, password: undefined }
    });
};

export const logout = async (request: FastifyRequest<{ Body?: LogoutRequest }>, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        await UserTokenModel.revokeByToken(token);
    }

    return sendSuccess(reply, {
        message: 'Logged out successfully'
    });
};

export const register = async (request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) => {
    const { username, email, password } = request.body;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
        return sendError(reply, RESPONSE_CODES.USER_ALREADY_EXISTS, 'Registration failed: Email already exists');
    }

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
        return sendError(reply, RESPONSE_CODES.USER_ALREADY_EXISTS, 'Registration failed: Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
        username,
        email,
        password: hashedPassword,
        disabled: 0
    });

    const token = jwt.sign({ 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email 
    }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

    await UserTokenModel.create({
        user_id: newUser.id,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        disabled: 0
    });

    return sendSuccess(reply, {
        user: { ...newUser, password: undefined }
    });
};

export const getUser = async (request: FastifyRequest<{ Body: GetUserRequest }>, reply: FastifyReply) => {
    const { id } = request.body;
    
    const user = await UserModel.findById(id);

    if (!user) {
        return sendError(reply, RESPONSE_CODES.USER_NOT_FOUND, 'User not found');
    }
    
    return sendSuccess(reply, { user: { ...user, password: undefined } });
};

export const getUsers = async (request: FastifyRequest<{ Body: GetUsersRequest }>, reply: FastifyReply) => {
    const page_info = request.body.page_info || {};
    const { page = 1, size = 10, sort, filter } = page_info;

    const { users, total } = await UserModel.findAll({ page, size, sort, filter });

    return sendSuccess(reply, {
        items: users.map(user => ({ ...user, password: undefined })),
        page_info: { page, size, total }
    });
};

export const updateUser = async (request: FastifyRequest<{ Body: UpdateUserRequest }>, reply: FastifyReply) => {
    const { id, username, email, password, disabled } = request.body;

    const existingUser = await UserModel.findById(id);

    if (!existingUser) {
        return sendError(reply, RESPONSE_CODES.USER_NOT_FOUND, 'Update failed: User not found');
    }

    let updateData: Partial<{ username: string; email: string; password: string; disabled: number }> = {};

    if (username !== undefined) {
        const existingUsername = await UserModel.findByUsername(username);
        if (existingUsername && existingUsername.id !== id) {
            return sendError(reply, RESPONSE_CODES.USER_ALREADY_EXISTS, 'Update failed: Username already exists');
        }
        updateData.username = username;
    }

    if (email !== undefined) {
        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail && existingEmail.id !== id) {
            return sendError(reply, RESPONSE_CODES.USER_ALREADY_EXISTS, 'Update failed: Email already exists');
        }
        updateData.email = email;
    }

    if (disabled !== undefined) updateData.disabled = disabled;

    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await UserModel.update(id, updateData);
    
    if (!updatedUser) {
        return sendError(reply, RESPONSE_CODES.USER_NOT_FOUND, 'Update failed: User not found');
    }

    return sendSuccess(reply, { user: { ...updatedUser, password: undefined } });
};

export const deleteUser = async (request: FastifyRequest<{ Body: DeleteUserRequest }>, reply: FastifyReply) => {
    const { id } = request.body;

    const success = await UserModel.delete(id);

    if (!success) {
        return sendError(reply, RESPONSE_CODES.USER_NOT_FOUND, 'Delete failed: User not found');
    }
    
    return sendSuccess(reply, {
        message: 'User deleted successfully'
    });
};

export const getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const user = await UserModel.findById(request.user.id);

    if (!user) {
        return sendError(reply, RESPONSE_CODES.USER_NOT_FOUND, 'User not found');
    }

    return sendSuccess(reply, { user: { ...user, password: undefined } });
};

export const updateProfile = async (request: FastifyRequest<{ Body: ProfileRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { username, email } = request.body;
    let updateData: Partial<{ username: string; email: string }> = {};

    if (username !== undefined) {
        const existingUsername = await UserModel.findByUsername(username);
        if (existingUsername && existingUsername.id !== request.user.id) {
            return sendError(reply, RESPONSE_CODES.USER_ALREADY_EXISTS, 'Update failed: Username already exists');
        }
        updateData.username = username;
    }

    if (email !== undefined) {
        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail && existingEmail.id !== request.user.id) {
            return sendError(reply, RESPONSE_CODES.USER_ALREADY_EXISTS, 'Update failed: Email already exists');
        }
        updateData.email = email;
    }

    const updatedUser = await UserModel.update(request.user.id, updateData);
    
    if (!updatedUser) {
        return sendError(reply, RESPONSE_CODES.PROFILE_UPDATE_FAILED, 'Profile update failed');
    }

    return sendSuccess(reply, { user: { ...updatedUser, password: undefined } });
};

export const resetPassword = async (request: FastifyRequest<{ Body: ResetPasswordRequest }>, reply: FastifyReply) => {
    const { email, newPassword, currentPassword } = request.body;

    if (!request.user && !email) {
        return sendError(reply, RESPONSE_CODES.INVALID_REQUEST, 'Email is required for password reset');
    }

    if (request.user && !currentPassword) {
        return sendError(reply, RESPONSE_CODES.INVALID_REQUEST, 'Current password is required for password change');
    }

    let user: any;

    if (request.user) {
        user = await UserModel.findById(request.user.id);
        if (!user) {
            return sendError(reply, RESPONSE_CODES.USER_NOT_FOUND, 'User not found');
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword!, user.password);
        if (!isCurrentPasswordValid) {
            return sendError(reply, RESPONSE_CODES.INVALID_PASSWORD, 'Invalid current password');
        }
    } else {
        user = await UserModel.findByEmail(email);
        if (!user) {
            return sendError(reply, RESPONSE_CODES.USER_NOT_FOUND, 'User not found');
        }
    }

    const hashedPassword = await bcrypt.hash(newPassword!, 10);
    await UserModel.update(user.id, { password: hashedPassword });

    await UserTokenModel.revokeByUserId(user.id);

    return sendSuccess(reply, {
        message: 'Password reset successfully'
    });
};

export const getTokens = async (request: FastifyRequest<{ Body: TokensRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const page_info = request.body.page_info || {};
    const { page = 1, size = 10 } = page_info;

    const { tokens, total } = await UserTokenModel.findByUserId(request.user.id, { page, size });

    return sendSuccess(reply, {
        items: tokens.map(token => ({ ...token, user: undefined })),
        page_info: { page, size, total }
    });
};

export const revokeToken = async (request: FastifyRequest<{ Body: RevokeTokenRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { token } = request.body;
    const userToken = await UserTokenModel.findByToken(token);

    if (!userToken || userToken.user_id !== request.user.id) {
        return sendError(reply, RESPONSE_CODES.TOKEN_NOT_FOUND, 'Token not found');
    }

    await UserTokenModel.revokeByToken(token);

    return sendSuccess(reply, {
        message: 'Token revoked successfully'
    });
};

export const getUserStudios = async (request: FastifyRequest<{ Body: UserStudiosRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const page_info = request.body.page_info || {};
    const { page = 1, size = 10 } = page_info;

    const { items, total } = await UserStudioModel.findAllByUserId(request.user.id, { page, size });

    return sendSuccess(reply, {
        items,
        page_info: { page, size, total }
    });
};

export const switchStudio = async (request: FastifyRequest<{ Body: SwitchStudioRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { studio_id } = request.body;

    const userStudio = await UserStudioModel.findUserStudio(request.user.id, studio_id);
    if (!userStudio) {
        return sendError(reply, RESPONSE_CODES.STUDIO_NOT_FOUND, 'Studio not found');
    }

    await UserStudioModel.clearDefaultStudios(request.user.id);
    await UserStudioModel.update(userStudio.id, { is_default: true });

    return sendSuccess(reply, {
        message: 'Studio switched successfully'
    });
};

export const deleteStudio = async (request: FastifyRequest<{ Body: DeleteStudioRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { studio_id } = request.body;

    const userStudio = await UserStudioModel.findUserStudio(request.user.id, studio_id);
    if (!userStudio) {
        return sendError(reply, RESPONSE_CODES.STUDIO_NOT_FOUND, 'Studio not found');
    }

    if (userStudio.is_owner) {
        return sendError(reply, RESPONSE_CODES.STUDIO_OWNER_CANNOT_LEAVE, 'Studio owners cannot leave their studio');
    }

    await UserStudioModel.deleteByUserIdStudioId(request.user.id, studio_id);

    return sendSuccess(reply, {
        message: 'Studio deleted successfully'
    });
};

export const createStudio = async (request: FastifyRequest<{ Body: CreateStudioRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { name, description } = request.body;

    // Check if studio name already exists
    const existingStudio = await StudioModel.findByName(name);
    if (existingStudio) {
        return sendError(reply, RESPONSE_CODES.STUDIO_ALREADY_EXISTS, 'Studio with this name already exists');
    }

    // Create studio
    const studio = await StudioModel.create({
        name,
        description,
        disabled: 0
    });

    // Add user as owner
    const userStudio = await UserStudioModel.create({
        user_id: request.user.id,
        studio_id: studio.id,
        role: 'owner',
        is_default: true,
        is_owner: true
    });

    return sendSuccess(reply, {
        studio,
        userStudio
    });
};