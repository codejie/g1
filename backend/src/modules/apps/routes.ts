import { FastifyInstance } from 'fastify';
import * as appsHandlers from './handlers.js';
import { authenticate } from '../../middleware/auth.js';

export default async function (fastify: FastifyInstance) {
    fastify.post('/apps/create', {
        preHandler: [authenticate],
        schema: {
            description: 'Create new app',
            tags: ['Apps'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['app_type', 'name'],
                properties: {
                    app_type: { type: 'number', description: 'App type' },
                    name: { type: 'string', description: 'App name' },
                    version: { type: 'string', description: 'App version' },
                    description: { type: 'string', description: 'App description' }
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
                                version: { type: 'string' },
                                description: { type: 'string' },
                                status: { type: 'number' },
                                disabled: { type: 'number' },
                                created: { type: 'string', format: 'date-time' },
                                updated: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    }, appsHandlers.createApp);

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
                                status: { type: 'number' },
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
            description: 'Get my apps list',
            tags: ['Apps'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    app_type: { type: 'number', description: 'Filter by app type' }
                }
            },
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
                                    version: { type: 'string' },
                                    description: { type: 'string' },
                                    status: { type: 'number' },
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
