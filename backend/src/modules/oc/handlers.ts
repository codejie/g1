import { FastifyRequest, FastifyReply } from 'fastify';
import {
    CreateOCSessionRequest, CreateOCSessionResponse,
    UpdateOCSessionRequest, UpdateOCSessionResponse,
    SendSessionMessageRequest, SendSessionMessageResponse,
    SkillsCallbackRequest
} from '../../types/oc';
import { RESPONSE_CODES } from '../../types/common';
import { sendSuccess, sendError } from '../../utils/response';
import config from '../../config';
import { randomUUID } from 'crypto';
import { OCSessionModel, OCSkillCallbackModel } from './model';
import fsPromises from 'fs/promises';
import path from 'path';
import { getSkillById, getSkillParts } from '../../skills';

const OPENCODE_URL = config.OPENCODE_URL;
const MESSAGE_DATA_DIR = path.join(process.cwd(), 'data', 'session_messages');

let ocClient: any;
async function getOCClient() {
    if (!ocClient) {
        const sdk = await import('@opencode-ai/sdk');
        ocClient = (sdk as any).createOpencodeClient({
            baseUrl: OPENCODE_URL
        });

        // Subscribe to events from OpenCode
        (async () => {
            try {
                const response = await ocClient.event.subscribe();
                console.log('[OpenCode] SSE subscription started');

                for await (const event of response.stream) {
                    // console.log('[OpenCode] SSE event:', event);
                    const eventType = event.type || '';
                    if (eventType.startsWith('message.') || eventType.startsWith('session.')) {
                        let openCodeSessionId: string | undefined;
                        if (eventType === 'message.part.updated') {
                            openCodeSessionId = event.properties?.part?.sessionID;
                        } else {
                            openCodeSessionId = event.properties?.sessionID;
                        }
                        // console.log('[OpenCode] SSE sessionID:', openCodeSessionId);
                        if (openCodeSessionId) {
                            const session = await OCSessionModel.findBySessionId(openCodeSessionId);
                            if (session) {
                                sendSSEMessage(session.id, 'oc_session_message', event);
                            }
                        }                        
                    } else if (eventType.startsWith('server.')) {
                        // console.log('[OpenCode] SSE server event:', event);
                    } else {
                        console.log('[OpenCode] SSE unknown event:', event);
                    }
                }
            } catch (error) {
                console.error('[OpenCode] SSE subscription error:', error);
                ocClient = null;
            }
        })();
    }
    return ocClient;
}

// Map to store session_id to SSE connection relationship
const sseConnections = new Map<number, FastifyReply>();

// Create OC Session handler
export const createOCSession = async (request: FastifyRequest<{ Body: CreateOCSessionRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { type, title, extra } = request.body;

    try {
        const client = await getOCClient();
        const openCodeSession = await client.session.create({
            body: {
                title: title || 'New Session'
            }
        });

        // Save session to database
        const session = await OCSessionModel.create({
            user_id: userId,
            session_id: openCodeSession.data.id,
            parent_id: extra?.parent_id || null,
            directory: extra?.directory || null,
            title: title || openCodeSession.data.title || null,
            type: type || 0,
            skill_id: 0,
            disabled: 0
        });

        return sendSuccess(reply, {
            session_id: session.id,
            type: session.type,
            title: session.title || '',
            skill_id: session.skill_id
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
        // Get app_test skill and send command
        const skill = getSkillById(10);
        if (skill) {
            const skillParts = getSkillParts(skill);
            const client = await getOCClient();
            const openCodeMessage = await client.session.promptAsync({
                path: { id: session.session_id },
                body: {
                    model: {
                        providerID: config.LLM_PROVIDER,
                        modelID: config.LLM_MODEL,
                    },
                    parts: [
                        {
                            type: 'text',
                            text: `执行${skill.name}，skill所需重要配置数据为:{'user_id':${userId}, 'session_id':'${session.session_id}'}，不要在应答中使用'tool'的'question'等类似内容。${skill.extra_arguments || ''}`,
                        }
                    ]
                }
            })


            // Map response items similarly to sendSessionMessage
            if (openCodeMessage && openCodeMessage.data.parts) {
                items = openCodeMessage.data.parts.map((item: any) => ({
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
            skill_id: skill.id,
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

        const client = await getOCClient();
        const openCodeMessage = await client.session.promptAsync({
            path: { id: session.session_id },
            body: {
                model: {
                    providerID: extra?.provider_id || config.LLM_PROVIDER,
                    modelID: extra?.model_id || config.LLM_MODEL,
                },
                parts: [
                    {
                        type: 'text',
                        text: content
                    }
                ]
            }
        })
        console.log('[OpenCode Response]', JSON.stringify(openCodeMessage, null, 2));

        // Map response items
        const items = openCodeMessage.data.parts?.map((item: any) => ({
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
                    parts: openCodeMessage.data.parts || [],
                    skill_id: 0
                },
                timestamp: new Date().toISOString()
            });

            await fsPromises.writeFile(messageFilePath, JSON.stringify(existingMessages, null, 2));
        } catch (fileError) {
            console.error('Failed to store message to file:', fileError);
        }

        return sendSuccess(reply, {
            session_id: session.id,
            skill_id: session.skill_id,
            items: items
        });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to send message');
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
        const session = await OCSessionModel.findBySessionId(session_id);
        if (!session) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Session not found');
        }

        // Save callback to database
        await OCSkillCallbackModel.create({
            skill_id: skill_id ? Number(skill_id) : 0,
            session_id: session_id,
            event: event,
            type: type || 'unknown',
            data: data
        });

        // Notify client via SSE using the local session_id
        const sent = sendSSEMessage(session.id, event, {
            session_id: session.id,
            skill_id: skill_id || session.skill_id,
            skill_name: (skill_id && getSkillById(Number(skill_id))?.name) || (session.skill_id && getSkillById(session.skill_id)?.name) || 'unknown',
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

// SSE handler
export const sseStream = async (request: FastifyRequest<{ Querystring: { session_id: number; skill_id?: number; skill_name?: string } }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { session_id } = request.query;
    // skill_id and skill_name removed from query params, use session defaults or unknown

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
        // reply.raw.write(`event: connected\ndata: ${JSON.stringify({ session_id, skill_id: session.skill_id })}\n\n`);
        const payload = {
            event: 'connected'
        }
        reply.raw.write(JSON.stringify(payload) + '\n\n');

        // Store SSE connection info
        const effectiveSkillId = session.skill_id;
        const sseConnection = {
            session_id,
            skill_id: effectiveSkillId,
            skill_name: getSkillById(effectiveSkillId)?.name,
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
                // reply.raw.write(`:heartbeat\n\n`);
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
