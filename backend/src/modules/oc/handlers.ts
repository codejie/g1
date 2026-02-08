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

const OPENCODE_URL = config.OPENCODE_URL;
const MESSAGE_DATA_DIR = path.join(process.cwd(), 'data', 'session_messages');
const SKILL_CALLBACK_DATA_DIR = path.join(process.cwd(), 'data', 'skill_callbacks');

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

        // Build update data
        const updateData: any = {};
        if (type !== undefined) {
            updateData.type = type;
        }
        if (extra?.agent_id !== undefined) {
            updateData.agent_id = extra.agent_id;
        }
        if (extra?.title !== undefined) {
            updateData.title = extra.title;
        }

        // Update in database
        const updatedSession = await OCSessionModel.update(session_id, updateData);

        // Forward to OpenCode if needed
        try {
            await forwardToOpenCode(new URL(`/session/${session.session_id}`, OPENCODE_URL), 'POST', {
                type,
                appType: app_type,
                ...extra
            });
        } catch (openCodeError) {
            // Log but don't fail if OpenCode update fails
            console.error('Failed to update OpenCode session:', openCodeError);
        }

        return sendSuccess(reply, {
            session_id: updatedSession!.id,
            type: updatedSession!.type,
            agent_id: updatedSession!.agent_id
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
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR,  error?.message || 'Failed to send message');
    }
};

// Skills Callback handler
export const skillsCallback = async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
    const { skill_id, skill_version, session_id, type, data } = request.body as any;

    try {
        // Validate required fields
        if (!skill_id || !skill_version || !session_id || !type) {
            return sendError(reply, RESPONSE_CODES.INVALID_REQUEST, 'Missing required fields');
        }

        // Store callback data in database
        const callback = await OCSkillCallbackModel.create({
            skill_id,
            skill_version,
            session_id,
            type,
            data
        });

        // Store callback data to file
        const callbackFilePath = path.join(SKILL_CALLBACK_DATA_DIR, `${session_id}_${skill_id}.json`);
        try {
            await fsPromises.mkdir(SKILL_CALLBACK_DATA_DIR, { recursive: true });
            
            const callbackRecord = {
                callback_id: callback.id,
                skill_id,
                skill_version,
                session_id,
                type,
                data,
                timestamp: callback.created.toISOString()
            };

            // Read existing data if file exists
            let existingData: any[] = [];
            try {
                const existingContent = await fsPromises.readFile(callbackFilePath, 'utf-8');
                existingData = JSON.parse(existingContent);
            } catch {
                existingData = [];
            }

            existingData.push(callbackRecord);
            await fsPromises.writeFile(callbackFilePath, JSON.stringify(existingData, null, 2));
        } catch (fileError) {
            console.error('Failed to store callback data to file:', fileError);
        }

        return sendSuccess(reply, {
            code: 0,
            message: 'Callback received successfully',
            result: {
                callback_id: callback.id
            }
        });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to process callback');
    }
};

// SSE handler
export const sseStream = async (request: FastifyRequest<{ Querystring: { session_id: number; agent_id?: number; skill_id?: string } }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { session_id, agent_id, skill_id } = request.query;

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
            skill_id,
            user_id: userId,
            connected_at: new Date().toISOString()
        };

        // Log SSE connection
        console.log('[SSE] Client connected:', sseConnection);

        // Send periodic heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
            try {
                reply.raw.write(`:heartbeat\n\n`);
            } catch {
                clearInterval(heartbeatInterval);
            }
        }, 30000);

        // Handle client disconnect
        request.raw.on('close', () => {
            clearInterval(heartbeatInterval);
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
