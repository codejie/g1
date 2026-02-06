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
                                agent_id: { type: 'number' }
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
}
