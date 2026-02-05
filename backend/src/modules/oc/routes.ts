import { FastifyInstance } from 'fastify';
import * as ocHandlers from './handlers';
import { authenticate } from '../../middleware/auth';

export default async function (fastify: FastifyInstance) {
    fastify.post('/oc/create-session', {
        preHandler: [authenticate],
        schema: {
            description: 'Create OpenCode session',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    parent_id: { type: 'string', description: 'Parent session ID (optional)' },
                    directory: { type: 'string', description: 'Session directory path' },
                    title: { type: 'string', description: 'Session title' }
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
                            nullable: true,
                            properties: {
                                session: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        user_id: { type: 'number' },
                                        session_id: { type: 'string' },
                                        parent_id: { type: 'string' },
                                        directory: { type: 'string' },
                                        title: { type: 'string' },
                                        disabled: { type: 'number' },
                                        created: { type: 'string', format: 'date-time' },
                                        updated: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, ocHandlers.createOCSession);

    fastify.post('/oc/get-session', {
        preHandler: [authenticate],
        schema: {
            description: 'Get latest OpenCode session',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object'
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        code: { type: 'number' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            nullable: true,
                            properties: {
                                session: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        user_id: { type: 'number' },
                                        session_id: { type: 'string' },
                                        parent_id: { type: 'string' },
                                        directory: { type: 'string' },
                                        title: { type: 'string' },
                                        disabled: { type: 'number' },
                                        created: { type: 'string', format: 'date-time' },
                                        updated: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, ocHandlers.getOCSession);
}
