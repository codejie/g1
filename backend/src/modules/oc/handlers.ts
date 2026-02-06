import { FastifyRequest, FastifyReply } from 'fastify';
import { 
    CreateOCSessionRequest, CreateOCSessionResponse,
    UpdateOCSessionRequest, UpdateOCSessionResponse,
    SendSessionMessageRequest, SendSessionMessageResponse
} from '../../types/oc';
import { Response, RESPONSE_CODES } from '../../types/common';
import { sendSuccess, sendError } from '../../utils/response';
import config from '../../config';

const OPENCODE_URL = config.OPENCODE_URL;

// Temporary in-memory mapping between local session IDs and OpenCode session IDs
const sessionIdMap = new Map<number, string>();

// async function forwardToOpenCode<T>(endpoint: string, options: {
//     method?: string
//     body?: Record<string, any>
//     query?: Record<string, string>
// }): Promise<T> {
//     const url = new URL(endpoint, OPENCODE_URL);
//     if (options.query) {
//         Object.entries(options.query).forEach(([key, value]) => {
//             if (value) url.searchParams.append(key, value);
//         });
//     }

//     const response = await fetch(url.toString(), {
//         method: options.method || 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: options.body ? JSON.stringify(options.body) : undefined,
//     });

//     if (!response.ok) {
//         throw new Error(`OpenCode API error: ${response.statusText}`);
//     }

//     return response.json();
// }

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

    const { type, title, extra } = request.body;
    // const url = new URL('/session', OPENCODE_URL);
    try {
        const openCodeSession: any = await forwardToOpenCode(new URL(`/session`, OPENCODE_URL), 'POST', {
            title
        });

        const localSessionId = Date.now();
        sessionIdMap.set(localSessionId, openCodeSession.id); 
        return sendSuccess(reply, {
            session_id: localSessionId,
            type: openCodeSession.type || 0,
            title: openCodeSession.title,
            agent_id: openCodeSession.agentID || 0
        })
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to create session');
    }
};

// Update OC Session handler
export const updateOCSession = async (request: FastifyRequest<{ Body: UpdateOCSessionRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { session_id, type, app_type, extra } = request.body;

    try {
        const openCodeSessionId = sessionIdMap.get(session_id);
        if (!openCodeSessionId) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Session not found');
        }

        // Forward to OpenCode session update API
        // const openCodeSession = await forwardToOpenCode<{ id: string; type: number; agentID?: number }>(`/session/${openCodeSessionId}`, {
        //     method: 'POST',
        //     body: {
        //         type,
        //         appType: app_type,
        //         ...extra
        //     }
        // });

        return sendSuccess(reply, {
            session_id: session_id,
            type: 0, //openCodeSession.type,
            agent_id: 0 //openCodeSession.agentID
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

    const { session_id, type, content, extra } = request.body;

    const openCodeSessionId = sessionIdMap.get(session_id);
    if (!openCodeSessionId) {
        return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Session not found');
    }

    try {
        const openCodeMessage: any = await forwardToOpenCode(new URL(`/session/${openCodeSessionId}/message`, OPENCODE_URL), 'POST', {
            model: {
                providerID: 'opencode',
                modelID: 'kimi-k2.5-free', //'glm-4.7-freee'
            },
            parts: [
                {
                    type: type,
                    text: content
                }
            ]
        })

        const items = openCodeMessage.parts.map(item => ({
            id: item.id,
            role: item.role,
            type: item.type,
            content: item.text,
            created: new Date()
        }))
        return sendSuccess(reply, {
            session_id: session_id,
            agent_id: 0,
            items: items
        });
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR,  error?.message || 'Failed to send message');
    }
};
