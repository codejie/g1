import { FastifyRequest, FastifyReply } from 'fastify';
import { 
    CreateOCSessionRequest, CreateOCSessionResponse,
    GetOCSessionRequest, GetOCSessionResponse,
    OCSession
} from '../../types/oc';
import { Response, RESPONSE_CODES } from '../../types/common';
import { OCSessionModel } from './model';
import { sendSuccess, sendError } from '../../utils/response';
import config from '../../config';

export interface OpenCodeSession {
    id: string
    projectID: string
    directory: string
    parentID?: string
    title: string
    version: string
    time: {
        created: number
        updated: number
        compacting?: number
    }
}

const OPENCODE_URL = config.OPENCODE_URL;

async function forwardToOpenCode<T>(endpoint: string, options: {
    method?: string
    body?: Record<string, any>
    query?: Record<string, string>
}): Promise<T> {
    const url = new URL(endpoint, OPENCODE_URL);
    if (options.query) {
        Object.entries(options.query).forEach(([key, value]) => {
            if (value) url.searchParams.append(key, value);
        });
    }

    const response = await fetch(url.toString(), {
        method: options.method || 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
        throw new Error(`OpenCode API error: ${response.statusText}`);
    }

    return response.json();
}

export const createOCSession = async (request: FastifyRequest<{ Body: CreateOCSessionRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { parent_id, directory, title } = request.body;

    try {
        const openCodeSession: OpenCodeSession = await forwardToOpenCode<OpenCodeSession>('/session', {
            method: 'POST',
            body: {
                parentID: parent_id,
                title: title,
            },
            query: directory ? { directory } : undefined,
        });

        const session: OCSession = await OCSessionModel.create({
            user_id: request.user.id,
            session_id: openCodeSession.id,
            parent_id: openCodeSession.parentID,
            directory: openCodeSession.directory,
            title: openCodeSession.title,
            disabled: 0
        });

        return sendSuccess(reply, { session });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to create session');
    }
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