import { FastifyInstance } from 'fastify';
import * as ocHandlers from './handlers.js';
import { authenticate } from '../../middleware/auth.js';

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

    // Session Skill Active
    fastify.post('/oc/session/skill_active', {
        preHandler: [authenticate],
        schema: {
            description: 'Activate a skill in OpenCode session',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['session_id', 'skill_type'],
                properties: {
                    session_id: { type: 'number', description: 'Session ID' },
                    skill_type: { type: 'number', description: 'Skill type ID' },
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
                                skill_id: { type: 'number' },
                                skill_name: { type: 'string' },
                                message_type: { type: 'string' },
                                message_content: {}
                            }
                        }
                    }
                }
            }
        }
    }, ocHandlers.sessionSkillActive);

    // Session Message Async
    fastify.post('/oc/session/message/async', {
        preHandler: [authenticate],
        schema: {
            description: 'Send async message to OpenCode session',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['session_id', 'message_content'],
                properties: {
                    session_id: { type: 'number', description: 'Session ID' },
                    message_type: { type: 'string', enum: ['text', 'part'], description: 'Message type' },
                    message_content: {},
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        code: { type: 'number' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, ocHandlers.sessionMessageAsync);

    // Session Message Question
    fastify.post('/oc/session/tool/question', {
        preHandler: [authenticate],
        schema: {
            description: 'Reply to a question from OpenCode session',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['session_id', 'question_id'],
                properties: {
                    session_id: { type: 'number', description: 'Session ID' },
                    question_id: { type: 'string', description: 'Question ID' },
                    message_id: { type: 'string', description: 'Message ID' },
                    call_id: { type: 'string', description: 'Call ID' },
                    result: { type: 'string', enum: ['reply', 'reject'], description: 'Action type: reply or reject' },
                    message_type: { type: 'string', description: 'Message type' },
                    message_content: {},
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        code: { type: 'number' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, ocHandlers.sessionMessageQuestion);

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

    // SSE Subscribe
    fastify.get('/oc/session/sse', {
        preHandler: [authenticate],
        schema: {
            description: 'Server-Sent Events stream for real-time session updates',
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
    }, ocHandlers.sessionSSESubscribe);
}

