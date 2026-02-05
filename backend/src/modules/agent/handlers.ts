import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { 
    CreateSessionRequest, CreateSessionResponse, CreateSessionResult,
    GetSessionRequest, GetSessionResponse, GetSessionResult,
    GetSessionsRequest, GetSessionsResponse,
    UpdateSessionRequest, UpdateSessionResponse, UpdateSessionResult,
    DeleteSessionRequest, DeleteSessionResponse, DeleteSessionResult,
    Session
} from '../../types/agent';
import { Response, RESPONSE_CODES } from '../../types/common';
import { SessionModel } from './model';
import { ApiError } from '../../utils/errors';

export const createSession = async (request: FastifyRequest<{ Body: CreateSessionRequest }>, reply: FastifyReply) => {
    const { parentId, title } = request.body;
    
    const newSession: Session = await SessionModel.create({
        id: uuidv4(),
        parentId,
        title,
        directory: '',
        created: new Date(),
        updated: new Date(),
    });

    const response: CreateSessionResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            session: newSession
        }
    };
    reply.code(RESPONSE_CODES.HTTP_CREATED).send(response);
};

export const getSession = async (request: FastifyRequest<{ Body: GetSessionRequest }>, reply: FastifyReply) => {
    const { id } = request.body;

    const session: Session | undefined = await SessionModel.findById(id);

    if (!session) {
        throw ApiError.notFound('Session not found', RESPONSE_CODES.SESSION_NOT_FOUND);
    }
    
    const response: GetSessionResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: { session }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(response);
};

export const getSessions = async (request: FastifyRequest<{ Body: GetSessionsRequest }>, reply: FastifyReply) => {
    const page_info = request.body.page_info || {};
    const { page = 1, size = 10, sort, filter } = page_info;

    const { sessions, total } = await SessionModel.findAll({ page, size, sort, filter });

    const response: GetSessionsResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            items: sessions,
            page_info: {
                page,
                size,
                total
            }
        }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(response);
};

export const updateSession = async (request: FastifyRequest<{ Body: UpdateSessionRequest }>, reply: FastifyReply) => {
    const { id, parentId, directory, title } = request.body;

    const updateData: Partial<Session> = {
        updated: new Date()
    };

    if (parentId !== undefined) updateData.parentId = parentId;
    if (directory !== undefined) updateData.directory = directory;
    if (title !== undefined) updateData.title = title;

    const updatedSession = await SessionModel.update(id, updateData);

    if (!updatedSession) {
        throw ApiError.notFound('Session not found', RESPONSE_CODES.SESSION_NOT_FOUND);
    }

    const response: UpdateSessionResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: { session: updatedSession }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(response);
};

export const deleteSession = async (request: FastifyRequest<{ Body: DeleteSessionRequest }>, reply: FastifyReply) => {
    const { id } = request.body;

    const success = await SessionModel.delete(id);

    if (!success) {
        throw ApiError.notFound('Session not found', RESPONSE_CODES.SESSION_NOT_FOUND);
    }
    
    const response: DeleteSessionResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            message: 'Session deleted successfully'
        }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(response);
};