import { FastifyRequest, FastifyReply } from 'fastify';
import {
    CreateMessageRequest, CreateMessageResponse,
    GetMessageRequest, GetMessageResponse,
    ListMessagesRequest, ListMessagesResponse,
    OCMessage
} from '../../types/oc_message';
import { Response, RESPONSE_CODES } from '../../types/common';
import { OCMessageModel } from './message-model';
import { sendSuccess, sendError } from '../../utils/response';
import { OCSessionModel } from './model';

export const createMessage = async (request: FastifyRequest<{ Body: CreateMessageRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { session_id, message } = request.body;

    try {
        const session = await OCSessionModel.findBySessionId(session_id);
        if (!session) {
            return sendError(reply, RESPONSE_CODES.OC_SESSION_NOT_FOUND, 'Session not found');
        }

        const newMessage: OCMessage = await OCMessageModel.create({
            user_id: request.user.id,
            session_id,
            message
        });

        return sendSuccess(reply, { message: newMessage });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to create message');
    }
};

export const getMessage = async (request: FastifyRequest<{ Params: GetMessageRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { id } = request.params;

    try {
        const message = await OCMessageModel.findById(id);
        if (!message) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Message not found');
        }

        return sendSuccess(reply, { message });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to get message');
    }
};

export const listMessages = async (request: FastifyRequest<{ Querystring: ListMessagesRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { session_id, page_info } = request.query;
    const page = page_info?.page || 1;
    const size = page_info?.size || 20;

    try {
        let messages: OCMessage[];

        if (session_id) {
            messages = await OCMessageModel.findBySessionId(session_id);
        } else {
            messages = await OCMessageModel.findByUserId(request.user.id);
        }

        const start = (page - 1) * size;
        const paginatedMessages = messages.slice(start, start + size);

        return sendSuccess(reply, {
            messages: paginatedMessages,
            page_info: {
                page,
                size,
                total: messages.length
            }
        });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to list messages');
    }
};

export const deleteMessage = async (request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { id } = request.params;

    try {
        const message = await OCMessageModel.findById(id);
        if (!message) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Message not found');
        }

        const deleted = await OCMessageModel.delete(id);
        if (!deleted) {
            return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, 'Failed to delete message');
        }

        return sendSuccess(reply, { success: true });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to delete message');
    }
};
