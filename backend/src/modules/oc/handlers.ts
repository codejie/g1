import { FastifyRequest, FastifyReply } from 'fastify';
import {
    CreateOCSessionRequest, CreateOCSessionResponse,
    UpdateOCSessionRequest, UpdateOCSessionResponse,
    SendSessionMessageRequest, SendSessionMessageResponse
} from '../../types/oc';
import { Response, RESPONSE_CODES } from '../../types/common';
import { sendSuccess, sendError } from '../../utils/response';
import config from '../../config';
import { randomUUID } from 'crypto';
import { OCSessionModel, OCSkillCallbackModel } from './model';
import fsPromises from 'fs/promises';
import path from 'path';
import { getAgentById, getAgentParts } from '../../agents';

const OPENCODE_URL = config.OPENCODE_URL;
const MESSAGE_DATA_DIR = path.join(process.cwd(), 'data', 'session_messages');
const SKILL_CALLBACK_DATA_DIR = path.join(process.cwd(), 'data', 'skill_callbacks');

// Map to store session_id to SSE connection relationship
const sseConnections = new Map<number, FastifyReply>();

// Forward request to OpenCode API
async function forwardToOpenCode(url: URL, method: string, body: any): Promise<any> {
    const reply = await fetch(url.toString(), {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
    if (!reply.ok) {
        throw new Error(`OpenCode API error: ${reply.statusText}`);
    }
    return reply.json()
}

// Create OC Session handler
export const createOCSession = async (request: FastifyRequest<{ Body: CreateOCSessionRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { type, title, extra } = request.body;

    try {
        // Generate a unique session ID for database
        const dbSessionId = randomUUID();

        // Forward to OpenCode to create session
        const openCodeSession: any = await forwardToOpenCode(new URL(`/session`, OPENCODE_URL), 'POST', {
            title: title || 'New Session',
            parentId: extra?.parent_id || null
        });

        // Save session to database
        const session = await OCSessionModel.create({
            user_id: userId,
            session_id: openCodeSession.id,
            parent_id: extra?.parent_id || null,
            directory: extra?.directory || null,
            title: title || openCodeSession.title || null,
            type: type || 0,
            agent_id: openCodeSession.agentID || 0,
            disabled: 0
        });

        return sendSuccess(reply, {
            session_id: session.id,
            type: session.type,
            title: session.title || '',
            agent_id: session.agent_id
        });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to create session');
    }
};

// Update OC Session handler
export const updateOCSession = async (request: FastifyRequest<{ Body: UpdateOCSessionRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { session_id, type, app_type, extra } = request.body;

    try {
        // Find the session in database
        const session = await OCSessionModel.findByLocalId(session_id);
        if (!session) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Session not found');
        }

        // Verify ownership
        if (session.user_id !== userId) {
            return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Not authorized to update this session');
        }


        let items: any[] = [];
        // Get app_test agent and send command
        const agent = getAgentById(1);
        if (agent) {
            const agentParts = getAgentParts(agent);
            const commandBody = {
                command: agent.skill_name,
                arguments: `'session_id:${session.session_id}'。${agent.arguments || ''}`,
                agent: agent.type,
                model: agent.provider && agent.model ? `${agent.provider}/${agent.model}` : "opencode/kimi-k2.5-free",
                parts: agentParts
            };

            const commandResponse = await forwardToOpenCode(
                new URL(`/session/${session.session_id}/command`, OPENCODE_URL),
                'POST',
                commandBody
            );

            // Map response items similarly to sendSessionMessage
            if (commandResponse && commandResponse.parts) {
                items = commandResponse.parts.map((item: any) => ({
                    id: item.id || randomUUID(),
                    role: item.role || 'assistant',
                    type: item.type || 'text',
                    content: item.text || '',
                    created: new Date().toISOString()
                }));
            }
        }

        return sendSuccess(reply, {
            session_id: session_id,
            agent_id: agent.id,
            items: items.length > 0 ? items : undefined
        });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to update session');
    }
};

// Send Session Message handler
export const sendSessionMessage = async (request: FastifyRequest<{ Body: SendSessionMessageRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { session_id, type, content, extra } = request.body;

    try {
        // Find the session in database
        const session = await OCSessionModel.findByLocalId(session_id);
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
            type: type || 'text',
            content: content,
            created: new Date().toISOString()
        };

        // Forward message to OpenCode
        const openCodeMessage: any = await forwardToOpenCode(
            new URL(`/session/${session.session_id}/message`, OPENCODE_URL),
            'POST',
            {
                model: {
                    providerID: 'opencode',
                    modelID: extra?.model_id || 'kimi-k2.5-free',
                },
                parts: [
                    {
                        type: type || 'text',
                        text: content
                    }
                ]
            }
        );

        console.log('[OpenCode Response]', JSON.stringify(openCodeMessage, null, 2));

        // Map response items
        const items = openCodeMessage.parts?.map((item: any) => ({
            id: item.id,
            role: item.role,
            type: item.type,
            content: item.text || '',
            created: new Date().toISOString()
        })) || [];

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
                    parts: openCodeMessage.parts || [],
                    agent_id: openCodeMessage.agentID || 0
                },
                timestamp: new Date().toISOString()
            });

            await fsPromises.writeFile(messageFilePath, JSON.stringify(existingMessages, null, 2));
        } catch (fileError) {
            console.error('Failed to store message to file:', fileError);
        }

        return sendSuccess(reply, {
            session_id: session.id,
            agent_id: session.agent_id,
            items: items
        });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to send message');
    }
};

// Skills Callback handler
export const skillsCallback = async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    const { session_id, agent_id, skill_id, event, type, data } = request.body as any;

    try {
        // Validate required fields
        if (!session_id || !agent_id || !event) {
            return sendError(reply, RESPONSE_CODES.INVALID_REQUEST, 'Missing required fields');
        }

        // Find the session to get the local session_id (session_id from OpenCode is a string)
        const session = await OCSessionModel.findBySessionId(session_id);
        if (!session) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Session not found');
        }
        const agent = getAgentById(1);

        // Notify client via SSE using the local session_id
        const sent = sendSSEMessage(session.id, event, { 
            session_id: session.id,
            agent_id,
            agent_name: agent?.name,
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
            reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
            return true;
        } catch (error) {
            console.error(`[SSE] Failed to send message to session ${session_id}:`, error);
            sseConnections.delete(session_id);
        }
    }
    return false;
}

// SSE handler
export const sseStream = async (request: FastifyRequest<{ Querystring: { session_id: number; agent_id?: number; agent_name?: string } }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { session_id, agent_id, agent_name } = request.query;

    try {
        // Find the session in database to verify ownership
        const session = await OCSessionModel.findByLocalId(session_id);
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
        reply.raw.write(`event: connected\ndata: ${JSON.stringify({ session_id, agent_id: session.agent_id })}\n\n`);

        // Store SSE connection info
        const sseConnection = {
            session_id,
            agent_id: agent_id || session.agent_id,
            agent_name,
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
                reply.raw.write(`:heartbeat\n\n`);
            } catch {
                clearInterval(heartbeatInterval);
                sseConnections.delete(session_id);
            }
        }, 30000);

        // Handle client disconnect
        request.raw.on('close', () => {
            clearInterval(heartbeatInterval);
            sseConnections.delete(session_id);
            console.log('[SSE] Client disconnected:', { session_id, agent_id });
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
