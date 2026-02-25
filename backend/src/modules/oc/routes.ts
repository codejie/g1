import { FastifyInstance } from 'fastify';
import * as ocHandlers from './handlers';
import { authenticate } from '../../middleware/auth';

export default async function (fastify: FastifyInstance) {
    // Create Session
    fastify.post('/oc/session/create', {
        preHandler: [authenticate],
        schema: {
            description: 'Create OpenCode session',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    type: { type: 'number', enum: [0, 1, 2], description: 'Session type (0/general, 1/coding, 2/debugging)' },
                    title: { type: 'string', description: 'Session title' },
                    extra: { type: 'object', description: 'Additional optional parameters' }
                }
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        code: { type: 'number' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                session_id: { type: 'number' },
                                type: { type: 'number' },
                                title: { type: 'string' },
                                agent_id: { type: 'number' }
                            }
                        }
                    }
                }
            }
        }
    }, ocHandlers.createOCSession);

    // Update Session
    fastify.post('/oc/session/update', {
        preHandler: [authenticate],
        schema: {
            description: 'Update OpenCode session parameters',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['session_id'],
                properties: {
                    session_id: { type: 'number', description: 'Session ID' },
                    type: { type: 'number', enum: [0, 1, 2], description: 'Session type' },
                    app_type: { type: 'number', enum: [0, 1, 2, 3], description: 'Application type (0/web, 1/android, 2/ios, 3/mobile)' },
                    extra: { type: 'object', description: 'Additional optional parameters' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        code: { type: 'number' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                session_id: { type: 'number' },
                                type: { type: 'number' },
                                agent_id: { type: 'number' },
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string' },
                                            role: { type: 'string' },
                                            type: { type: 'string' },
                                            content: { type: 'string' },
                                            created: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, ocHandlers.updateOCSession);

    // Send Session Message
    fastify.post('/oc/session/message', {
        preHandler: [authenticate],
        schema: {
            description: 'Send message to OpenCode session',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['session_id', 'content'],
                properties: {
                    session_id: { type: 'number', description: 'Session ID' },
                    type: { type: 'string', description: 'Message type (e.g., text, image)' },
                    content: { type: 'string', description: 'Message content' },
                    extra: { type: 'object', description: 'Additional optional parameters' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        code: { type: 'number' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                session_id: { type: 'number' },
                                agent_id: { type: 'number' },
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string' },
                                            role: { type: 'string' },
                                            type: { type: 'string' },
                                            content: { type: 'string' },
                                            created: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, ocHandlers.sendSessionMessage);

    // Question Reply
    fastify.post('/oc/session/question_reply', {
        preHandler: [authenticate],
        schema: {
            description: 'Reply to a question from OpenCode session',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['session_id', 'question_id', 'content'],
                properties: {
                    session_id: { type: 'number', description: 'Session ID' },
                    question_id: { type: 'string', description: 'Question ID' },
                    message_id: { type: 'string', description: 'Message ID' },
                    call_id: { type: 'string', description: 'Call ID' },
                    content: { type: 'string', description: 'User answer content' },
                    extra: { type: 'object', description: 'Additional optional parameters', additionalProperties: true }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        code: { type: 'number' },
                        message: { type: 'string' },
                        result: { type: 'object', additionalProperties: true }
                    }
                }
            }
        }
    }, ocHandlers.questionReply);

    // Skills Callback
    fastify.post('/oc/skills/callback', {
        schema: {
            description: 'Receive callback data from OpenCode Skills module',
            tags: ['OpenCode'],
            body: {
                type: 'object',
                required: ['session_id', 'skill_id', 'event'],
                properties: {
                    session_id: { type: 'string', description: 'Session ID' },
                    skill_id: { type: 'number', description: 'Skill ID' },
                    event: { type: 'string', description: 'Event type' },
                    type: { type: 'string', description: 'Data type' },
                    data: { type: 'object', description: 'Callback data' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        code: { type: 'number' },
                        message: { type: 'string' },
                        result: { type: 'object' }
                    }
                }
            }
        }
    }, ocHandlers.skillsCallback);

    // Skills Callback Alias
    fastify.post('/oc/callback', {
        schema: {
            description: 'Receive callback data from OpenCode Skills module (alias)',
            tags: ['OpenCode'],
            body: {
                type: 'object',
                required: ['session_id', 'skill_id', 'event'],
                properties: {
                    session_id: { type: 'string', description: 'Session ID' },
                    skill_id: { type: 'number', description: 'Skill ID' },
                    event: { type: 'string', description: 'Event type' },
                    type: { type: 'string', description: 'Data type' },
                    data: { type: 'object', description: 'Callback data' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        code: { type: 'number' },
                        message: { type: 'string' },
                        result: { type: 'object' }
                    }
                }
            }
        }
    }, ocHandlers.skillsCallback);

    // SSE Stream
    fastify.get('/oc/session/sse', {
        preHandler: [authenticate],
        schema: {
            description: 'Server-Sent Events stream for real-time updates',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                required: ['session_id'],
                properties: {
                    session_id: { type: 'number', description: 'Session ID' }
                }
            }
        }
    }, ocHandlers.sseStream);
}
