import { FastifyInstance } from 'fastify';
import * as appsHandlers from './handlers.js';
import { authenticate } from '../../middleware/auth.js';

export default async function (fastify: FastifyInstance) {
    fastify.post('/apps/app_prd_report/info', {
        preHandler: [authenticate],
        schema: {
            description: 'Get PRD report information',
            tags: ['Apps'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'number', description: 'PRD report ID' }
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
                                id: { type: 'number' },
                                skill_id: { type: 'number' },
                                session_id: { type: 'number' },
                                app_id: { type: 'number' },
                                result: { type: 'number' },
                                message: { type: 'string' },
                                file_id: { type: 'number' },
                                created: { type: 'string', format: 'date-time' },
                                updated: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    }, appsHandlers.getPrdReportInfo);

    fastify.post('/apps/info', {
        preHandler: [authenticate],
        schema: {
            description: 'Get app information',
            tags: ['Apps'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'number', description: 'App ID' }
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
                                id: { type: 'number' },
                                user_id: { type: 'number' },
                                app_type: { type: 'number' },
                                name: { type: 'string' },
                                description: { type: 'string' },
                                disabled: { type: 'number' },
                                created: { type: 'string', format: 'date-time' },
                                updated: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    }, appsHandlers.getAppInfo);

    fastify.post('/apps/list', {
        preHandler: [authenticate],
        schema: {
            description: 'Get my apps',
            tags: ['Apps'],
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        code: { type: 'number' },
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    user_id: { type: 'number' },
                                    app_type: { type: 'number' },
                                    name: { type: 'string' },
                                    description: { type: 'string' },
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
    }, appsHandlers.getMyApps);
}
