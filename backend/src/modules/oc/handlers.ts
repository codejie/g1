import { FastifyRequest, FastifyReply } from 'fastify';
import {
    SessionCreateRequest,
    SessionSSESubscribeRequest,
    SessionMessageAsyncRequest,
    SessionSkillActiveRequest,
    SessionMessageQuestionRequest,
    SkillsCallbackRequest
} from '../../types/oc.js';
import { RESPONSE_CODES } from '../../types/common.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import config from '../../config/index.js';
import { randomUUID } from 'crypto';
import { UserSessionModel, SkillsCallbackModel } from './model.js';
import fsPromises from 'fs/promises';
import path from 'path';
import { getSkillParts } from '../../skills/index.js';
import { customOCApi } from './custom-api.js';
import SkillModel from '../skills/model.js';

const MESSAGE_DATA_DIR = path.join(process.cwd(), 'data', 'session_messages');

// Map to store session_id to SSE connection relationship
const sseConnections = new Map<number, FastifyReply>();

// Create OC Session handler
export const createOCSession = async (request: FastifyRequest<{ Body: SessionCreateRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { type, title, extra } = request.body;

    try {
        const openCodeSession = await customOCApi.session.create(title || 'New Session');

        // Save session to database
        const session = await UserSessionModel.create({
            user_id: userId,
            session_id: openCodeSession.id,
            title: title || openCodeSession.title || undefined,
            type: type || 0,
            skill_id: undefined,
            disabled: 0
        });

        return sendSuccess(reply, {
            id: session.id,
            type: session.type as any,
            title: session.title || '',
            skill_id: session.skill_id
        });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to create session');
    }
};

// Session Skill Active handler
export const sessionSkillActive = async (request: FastifyRequest<{ Body: SessionSkillActiveRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { session_id, skill_type, extra } = request.body;

    try {
        // Find the session in database
        const session = await UserSessionModel.findById(session_id);
        if (!session) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Session not found');
        }

        // Verify ownership
        if (session.user_id !== userId) {
            return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Not authorized to update this session');
        }

        // Get skill by type from database
        const skills = await SkillModel.findByType(skill_type);
        if (!skills || skills.length === 0) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Skill not found');
        }

        // Use the first skill with matching type
        const skill = skills[0];

        // Send command to OpenCode API
        await customOCApi.session.promptAsync({
            sessionId: session.session_id,
            providerID: config.LLM_PROVIDER,
            modelID: config.LLM_MODEL,
            text: `执行${skill.name}，skill所需重要配置数据为:{'user_id':${userId}, 'session_id':'${session.session_id}'}。${skill.extra_arguments || ''}`
        });

        return sendSuccess(reply, {
            skill_id: skill.id,
            skill_name: skill.name,
            message_type: extra?.message_type,
            message_content: extra?.message_content
        });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to activate skill');
    }
};

// Session Message Async handler
export const sessionMessageAsync = async (request: FastifyRequest<{ Body: SessionMessageAsyncRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { session_id, message_type, message_content } = request.body;

    try {
        // Find the session in database
        const session = await UserSessionModel.findById(session_id);
        if (!session) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Session not found');
        }

        // Verify ownership
        if (session.user_id !== userId) {
            return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Not authorized to access this session');
        }

        // User message to store
        const userMessage = {
            id: randomUUID(),
            role: 'user',
            type: message_type || 'text',
            content: message_content,
            created: new Date().toISOString()
        };

        await customOCApi.session.promptAsync({
            sessionId: session.session_id,
            providerID: config.LLM_PROVIDER,
            modelID: config.LLM_MODEL,
            text: message_content
        });

        const items: any[] = []; // No synchronous items available with promptAsync

        // Store messages to file
        const messageFilePath = path.join(MESSAGE_DATA_DIR, `${session_id}.json`);
        try {
            await fsPromises.mkdir(MESSAGE_DATA_DIR, { recursive: true });

            let existingMessages: any[] = [];
            try {
                const existingContent = await fsPromises.readFile(messageFilePath, 'utf-8');
                existingMessages = JSON.parse(existingContent);
            } catch {
                existingMessages = [];
            }

            existingMessages.push({
                user_message: userMessage,
                opencode_response: {
                    parts: [], // Async streaming response parts aren't available here
                    skill_id: 0
                },
                timestamp: new Date().toISOString()
            });

            await fsPromises.writeFile(messageFilePath, JSON.stringify(existingMessages, null, 2));
        } catch (fileError) {
            console.error('Failed to store message to file:', fileError);
        }

        return sendSuccess(reply, {});
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to send message');
    }
};

// Session Message Question handler
export const sessionMessageQuestion = async (request: FastifyRequest<{ Body: SessionMessageQuestionRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { session_id, question_id, message_id, call_id, result, message_type, message_content } = request.body;

    try {
        if (!session_id || !question_id) {
            return sendError(reply, RESPONSE_CODES.INVALID_REQUEST, 'Missing required fields');
        }

        const session = await UserSessionModel.findById(session_id);
        if (!session) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Session not found');
        }

        if (session.user_id !== userId) {
            return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Not authorized to access this session');
        }

        if (result === 'reject') {
            // Reject the question
            await customOCApi.question.reject({
                requestID: question_id
            });

            return sendSuccess(reply, {});
        } else {
            // Default: reply to the question
            if (!message_content) {
                return sendError(reply, RESPONSE_CODES.INVALID_REQUEST, 'Content is required for reply');
            }

            await customOCApi.question.reply({
                requestID: question_id,
                answers: [[message_content]]
            });

            return sendSuccess(reply, {});
        }
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to reply question');
    }
};

// Skills Callback handler
export const skillsCallback = async (request: FastifyRequest<{ Body: SkillsCallbackRequest }>, reply: FastifyReply) => {
    const { session_id, skill_id, event, type, data } = request.body;

    try {
        // Validate required fields
        if (!session_id || !event) {
            return sendError(reply, RESPONSE_CODES.INVALID_REQUEST, 'Missing required fields');
        }

        // Find the session to get the local session_id (session_id from OpenCode is a string)
        const session = await UserSessionModel.findBySessionId(session_id);
        if (!session) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Session not found');
        }

        // Save callback to database
        await SkillsCallbackModel.create({
            skill_id: skill_id,
            session_id: session_id,
            event: event,
            type: type || 'unknown',
            data: data
        });

        // Notify client via SSE using the local session_id
        let skillName = 'unknown';
        if (skill_id) {
            const skill = await SkillModel.findById(skill_id);
            if (skill) skillName = skill.name;
        }
        const sent = sendSSEMessage(session.id, event, {
            session_id: session.id,
            skill_id: skill_id,
            skill_name: skillName,
            type,
            data
        });

        return sendSuccess(reply, {
            code: 0,
            message: 'Callback received successfully',
            result: {
                sse_sent: sent
            }
        });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to process callback');
    }
};

/**
 * Send SSE message to a specific session
 * @param session_id Session ID
 * @param event Event name
 * @param data Event data
 */
export function sendSSEMessage(session_id: number, event: string, data: any) {
    const reply = sseConnections.get(session_id);
    if (reply) {
        try {
            const payload = {
                event,
                data
            }
            reply.raw.write(JSON.stringify(payload) + '\n\n');
            // reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
            return true;
        } catch (error) {
            console.error(`[SSE] Failed to send message to session ${session_id}:`, error);
            sseConnections.delete(session_id);
        }
    }
    return false;
}

// Initialize OpenCode client and subscribe to SSE events
customOCApi.init(async (event) => {
    const eventType = event.type || '';
    if (eventType.startsWith('message.') || eventType.startsWith('session.')) {
        let openCodeSessionId: string | undefined;
        if (eventType === 'message.part.updated') {
            openCodeSessionId = event.properties?.part?.sessionID;
        } else {
            openCodeSessionId = event.properties?.sessionID;
        }
        if (openCodeSessionId) {
            const session = await UserSessionModel.findBySessionId(openCodeSessionId);
            if (session) {
                sendSSEMessage(session.id, 'oc_session_message', event);
            }
        }
    } else if (eventType.startsWith('question.')) {
        const openCodeSession = event.properties?.sessionID;
        if (openCodeSession) {
            const session = await UserSessionModel.findBySessionId(openCodeSession);
            if (session) {
                sendSSEMessage(session.id, 'oc_session_message_question', event);
            }
        } else {
            console.log('[OpenCode] SSE question event without sessionID:', event);
        }
    } else if (!eventType.startsWith('server.')) {
        console.log('[OpenCode] SSE unknown event:', event);
    }
});

// Session SSE Subscribe handler
export const sessionSSESubscribe = async (request: FastifyRequest<{ Querystring: SessionSSESubscribeRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { session_id } = request.query;

    try {
        // Find the session in database to verify ownership
        const session = await UserSessionModel.findById(session_id);
        if (!session) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Session not found');
        }

        // Verify ownership
        if (session.user_id !== userId) {
            return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Not authorized to access this session');
        }

        // Set up SSE headers
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'X-Accel-Buffering': 'no'
        });

        // Send initial connection event
        const payload = {
            event: 'connected'
        }
        reply.raw.write(JSON.stringify(payload) + '\n\n');

        // Store SSE connection info
        const effectiveSkillId = session.skill_id;
        let skillName = 'unknown';
        if (effectiveSkillId) {
            const skill = await SkillModel.findById(effectiveSkillId);
            if (skill) skillName = skill.name;
        }
        const sseConnection = {
            session_id,
            skill_id: effectiveSkillId,
            skill_name: skillName,
            user_id: userId,
            connected_at: new Date().toISOString()
        };

        // Log SSE connection
        console.log('[SSE] Client connected:', sseConnection);

        // Store SSE connection in map
        sseConnections.set(session_id, reply);

        // Send periodic heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
            try {
                const payload = {
                    event: 'server.heartbeat'
                }
                reply.raw.write(JSON.stringify(payload) + '\n\n');
            } catch {
                clearInterval(heartbeatInterval);
                sseConnections.delete(session_id);
            }
        }, 30000);

        // Handle client disconnect
        request.raw.on('close', () => {
            clearInterval(heartbeatInterval);
            sseConnections.delete(session_id);
            console.log('[SSE] Client disconnected:', { session_id });
        });

        // Keep the connection open (don't call reply.send())
        return reply;

    } catch (error: any) {
        console.error('[SSE] Error:', error?.message);
        try {
            reply.raw.write(`event: error\ndata: ${JSON.stringify({ message: error?.message || 'SSE error' })}\n\n`);
            reply.raw.end();
        } catch {
            // Ignore write errors during cleanup
        }
        return reply;
    }
};
