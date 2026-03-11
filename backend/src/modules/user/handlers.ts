import { FastifyRequest, FastifyReply } from 'fastify';
import {
    LoginRequest,
    LogoutRequest,
    RegisterRequest,
    ProfileRequest
} from '../../types/user.js';
import { RESPONSE_CODES } from '../../types/common.js';
import { UserModel, UserTokenModel } from './model.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config/index.js';

// Login handler
export const login = async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
    const { email, password } = request.body;

    try {
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
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Login failed');
    }
};

// Logout handler
export const logout = async (request: FastifyRequest<{ Body?: LogoutRequest }>, reply: FastifyReply) => {
    try {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            await UserTokenModel.revokeByToken(token);
        }

        return sendSuccess(reply, {
            message: 'Logged out successfully'
        });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Logout failed');
    }
};

// Register handler
export const register = async (request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) => {
    const { username, email, password } = request.body;

    try {
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
        }, 'Registration successful', RESPONSE_CODES.HTTP_CREATED);
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Registration failed');
    }
};

// Get profile handler
export const getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        if (!request.user) {
            return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
        }

        const userId = (request.user as any).id;
        const user = await UserModel.findById(userId);

        if (!user) {
            return sendError(reply, RESPONSE_CODES.USER_NOT_FOUND, 'User not found');
        }

        return sendSuccess(reply, {
            user: { ...user, password: undefined }
        });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to get profile');
    }
};

// Update profile handler
export const updateProfile = async (request: FastifyRequest<{ Body: ProfileRequest }>, reply: FastifyReply) => {
    try {
        if (!request.user) {
            return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
        }

        const userId = (request.user as any).id;
        const { username, email, name } = request.body;

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser && existingUser.id !== userId) {
                return sendError(reply, RESPONSE_CODES.CONFLICT, 'Email already in use');
            }
        }

        // Check if username is already taken by another user
        if (username) {
            const existingUser = await UserModel.findByUsername(username);
            if (existingUser && existingUser.id !== userId) {
                return sendError(reply, RESPONSE_CODES.CONFLICT, 'Username already in use');
            }
        }

        const updateData: any = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;

        const updatedUser = await UserModel.update(userId, updateData);

        if (!updatedUser) {
            return sendError(reply, RESPONSE_CODES.PROFILE_UPDATE_FAILED, 'Failed to update profile');
        }

        return sendSuccess(reply, {
            user: { ...updatedUser, password: undefined }
        });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to update profile');
    }
};
