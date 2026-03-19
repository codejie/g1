import { FastifyInstance } from 'fastify';
import * as filesHandlers from './handlers.js';
import { authenticate } from '../../middleware/auth.js';

export default async function (fastify: FastifyInstance) {
    fastify.post('/files/upload', {
        preHandler: [authenticate],
        schema: {
            description: 'Upload file content',
            tags: ['Files'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id', 'content'],
                properties: {
                    id: { type: 'number', description: 'File record ID' },
                    content: { type: 'string', description: 'File content' }
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
                                type: { type: 'string' },
                                path: { type: 'string' },
                                name: { type: 'string' },
                                status: { type: 'number' },
                                created: { type: 'string', format: 'date-time' },
                                updated: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    }, filesHandlers.uploadFile);

    fastify.post('/files/download', {
        preHandler: [authenticate],
        schema: {
            description: 'Download file metadata',
            tags: ['Files'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'number', description: 'File record ID' }
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
                                type: { type: 'string' },
                                name: { type: 'string' }
                            }
                        }
                    }
                }
            }
        }
    }, filesHandlers.downloadFile);

    fastify.post('/files/info', {
        preHandler: [authenticate],
        schema: {
            description: 'Get file information',
            tags: ['Files'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'number', description: 'File record ID' }
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
                                type: { type: 'string' },
                                path: { type: 'string' },
                                name: { type: 'string' },
                                status: { type: 'number' },
                                created: { type: 'string', format: 'date-time' },
                                updated: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    }, filesHandlers.getFileInfo);
}
