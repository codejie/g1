import { FastifyInstance } from 'fastify';
import { listFiles, downloadFile, uploadFile } from './handlers';
import { authenticate } from '../../middleware/auth';

export default async function (server: FastifyInstance) {
    // List Files
    server.post('/files/list', {
        preHandler: [authenticate],
        schema: {
            description: 'List files in user directory',
            tags: ['Files'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['path'],
                properties: {
                    path: { type: 'string', description: 'Directory path relative to user root' },
                    filter: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            type: { type: 'string' },
                            size: { type: 'number' },
                            created: { type: 'string' }
                        }
                    },
                    page_info: {
                        type: 'object',
                        properties: {
                            page: { type: 'number' },
                            size: { type: 'number' }
                        }
                    }
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
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            path: { type: 'string' },
                                            name: { type: 'string' },
                                            type: { type: 'string' },
                                            size: { type: 'number' },
                                            created: { type: 'string' },
                                            updated: { type: 'string' }
                                        }
                                    }
                                },
                                page_info: {
                                    type: 'object',
                                    properties: {
                                        page: { type: 'number' },
                                        size: { type: 'number' },
                                        total: { type: 'number' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, listFiles);

    // Download File
    server.post('/files/download', {
        preHandler: [authenticate],
        schema: {
            description: 'Download a file',
            tags: ['Files'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['path'],
                properties: {
                    path: { type: 'string', description: 'File path relative to user root' },
                    name: { type: 'string', description: 'Optional filename for download' }
                }
            },
            response: {
                200: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    }, downloadFile);

    // Upload File
    server.post('/files/upload', {
        preHandler: [authenticate],
        schema: {
            description: 'Upload a file',
            tags: ['Files'],
            security: [{ bearerAuth: [] }],
            consumes: ['multipart/form-data'],
            /* body schema removed to allow multipart streaming without validation error */
            response: {
                200: {
                    type: 'object',
                    properties: {
                        code: { type: 'number' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                path: { type: 'string' },
                                name: { type: 'string' },
                                type: { type: 'string' },
                                size: { type: 'number' },
                                created: { type: 'string' },
                                updated: { type: 'string' }
                            }
                        }
                    }
                }
            }
        }
    }, uploadFile);
}
