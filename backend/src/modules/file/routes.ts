import { FastifyInstance } from 'fastify';
import * as fileHandlers from './handlers';
import { authenticate } from '../../middleware/auth';

export default async function (fastify: FastifyInstance) {
    // Upload File
    fastify.post('/file/upload', {
        preHandler: [authenticate],
        schema: {
            description: 'Upload a file',
            tags: ['File'],
            security: [{ bearerAuth: [] }],
            consumes: ['multipart/form-data'],
            body: {
                type: 'object',
                properties: {
                    file: {
                        type: 'string',
                        format: 'binary',
                        description: 'File to upload'
                    }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'File uploaded successfully',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        data: {
                            type: 'object',
                            properties: {
                                fileName: { type: 'string', description: 'Uploaded file name' },
                                filePath: { type: 'string', description: 'File storage path' },
                                size: { type: 'number', description: 'File size in bytes' },
                                mimetype: { type: 'string', description: 'File MIME type' }
                            }
                        }
                    }
                }
            }
        }
    }, fileHandlers.uploadFile);

    // Download File
    fastify.post('/file/download', {
        preHandler: [authenticate],
        schema: {
            description: 'Download a file',
            tags: ['File'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['fileName'],
                properties: {
                    fileName: { type: 'string', description: 'Name of the file to download' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'File downloaded successfully',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        data: {
                            type: 'object',
                            properties: {
                                filePath: { type: 'string', description: 'File path' }
                            }
                        }
                    }
                }
            }
        }
    }, fileHandlers.downloadFile);
}