import { FastifyRequest, FastifyReply } from 'fastify';
import { 
    GetUserRequest, GetUserResponse,
    GetUsersRequest, GetUsersResponse,
    LoginRequest, LoginResponse,
    RegisterRequest, RegisterResponse,
    UpdateUserRequest, UpdateUserResponse,
    DeleteUserRequest, DeleteUserResponse,
    User
} from '../../types/user';
import { Response, RESPONSE_CODES } from '../../types/common';
import { UserModel } from './model';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { ApiError } from '../../utils/errors';

const JWT_SECRET = 'supersecret'; // Use a strong secret from environment variables in production

export const login = async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
    const { email, password } = request.body;

    const user: User | undefined = await UserModel.findByEmail(email);

    if (!user || !user.password) {
        throw ApiError.unauthorized('Invalid credentials', RESPONSE_CODES.USER_NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid credentials', RESPONSE_CODES.INVALID_PASSWORD);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    
    const loginResponse: LoginResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            token,
            user: { ...user, password: undefined } // Remove password before sending
        }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(loginResponse);
};

export const register = async (request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) => {
    const { email, password, name } = request.body;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
        throw ApiError.conflict('User with this email already exists', RESPONSE_CODES.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = await UserModel.create({
        id: uuidv4(),
        email,
        password: hashedPassword,
        name,
        status: 0, // active
        created: new Date(),
        updated: new Date()
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });

    const registerResponse: RegisterResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            user: { ...newUser, password: undefined }
        }
    };
    reply.code(RESPONSE_CODES.HTTP_CREATED).send(registerResponse);
};

export const getUser = async (request: FastifyRequest<{ Body: GetUserRequest }>, reply: FastifyReply) => {
    const { id } = request.body;
    
    const user: User | undefined = await UserModel.findById(id);

    if (!user) {
        throw ApiError.notFound('User not found', RESPONSE_CODES.USER_NOT_FOUND);
    }
    
    const response: GetUserResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: { user: { ...user, password: undefined } } // Remove password
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(response);
};

export const getUsers = async (request: FastifyRequest<{ Body: GetUsersRequest }>, reply: FastifyReply) => {
    const page_info = request.body.page_info || {};
    const { page = 1, size = 10, sort, filter } = page_info;

    const { users, total } = await UserModel.findAll({ page, size, sort, filter });

    const response: GetUsersResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            items: users.map(user => ({ ...user, password: undefined })),
            page_info: {
                page,
                size,
                total
            }
        }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(response);
};

export const updateUser = async (request: FastifyRequest<{ Body: UpdateUserRequest }>, reply: FastifyReply) => {
    const { id, name, email, password, status } = request.body;

    const existingUser = await UserModel.findById(id);

    if (!existingUser) {
        throw ApiError.notFound('User not found', RESPONSE_CODES.USER_NOT_FOUND);
    }

    let updateData: Partial<User> = {
        updated: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (status !== undefined) updateData.status = status;

    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await UserModel.update(id, updateData);
    
    if (!updatedUser) {
        throw ApiError.notFound('User not found', RESPONSE_CODES.USER_NOT_FOUND);
    }

    const updateUserResponse: UpdateUserResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            user: { ...updatedUser, password: undefined }
        }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(updateUserResponse);
};

export const deleteUser = async (request: FastifyRequest<{ Body: DeleteUserRequest }>, reply: FastifyReply) => {
    const { id } = request.body;

    const success = await UserModel.delete(id);

    if (!success) {
        throw ApiError.notFound('User not found', RESPONSE_CODES.USER_NOT_FOUND);
    }
    
    const deleteUserResponse: DeleteUserResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            message: 'User deleted successfully'
        }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(deleteUserResponse);
};