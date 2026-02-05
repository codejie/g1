import { FastifyRequest, FastifyReply } from 'fastify';
import { 
    CreateOCSessionRequest, CreateOCSessionResponse,
    GetOCSessionRequest, GetOCSessionResponse
} from '../../types/oc';
import { Response, RESPONSE_CODES } from '../../types/common';
import { OCSessionModel } from './model';
import { sendSuccess, sendError } from '../../utils/response';
import path from 'path';
import config from '../../config';

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

// Create OC Session handler
export const createOCSession = async (request: FastifyRequest<{ Body: CreateOCSessionRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { parent_id, directory, title } = request.body;

    const sessionDir = directory || path.join(config.UPLOAD_DIR, 'sessions', `session_${Date.now()}`);
    
    const sessionData = {
        user_id: request.user.id,
        parent_id,
        directory: sessionDir,
        title,
        disabled: 0
    };

    const session = await OCSessionModel.create(sessionData);

    return sendSuccess(reply, { session }, RESPONSE_CODES.HTTP_CREATED);
};

// Get OC Session handler
export const getOCSession = async (request: FastifyRequest<{ Body: GetOCSessionRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const session = await OCSessionModel.findLatestByUserId(request.user.id);

    if (!session) {
        return sendError(reply, RESPONSE_CODES.OC_SESSION_NOT_FOUND, 'No active session found');
    }

    return sendSuccess(reply, { session });
};