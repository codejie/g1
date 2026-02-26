import { FastifyInstance } from 'fastify';
import * as applicationHandlers from './handlers.js';
import * as fileHandlers from './file-handlers.js';
import { authenticate } from '../../middleware/auth.js';

export default async function (fastify: FastifyInstance) {
    fastify.post('/application/list', {
        preHandler: [authenticate],
        schema: {
            description: 'Get applications list with pagination',
            tags: ['Application'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    page_info: {
                        type: 'object',
                        properties: {
                            page: { type: 'number', minimum: 1, default: 1, description: 'Page number' },
                            size: { type: 'number', minimum: 1, maximum: 100, default: 10, description: 'Page size' },
                            sort: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        field: { type: 'string', description: 'Field to sort by' },
                                        order: { type: 'string', enum: ['ASC', 'DESC'], description: 'Sort order' }
                                    }
                                }
                            },
                            filter: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', description: 'Filter by application type' },
                                    status: { type: 'string', description: 'Filter by application status' },
                                    disabled: { type: 'number', description: 'Filter by disabled status' }
                                }
                            }
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
                            nullable: true,
                            properties: {
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            user_id: { type: 'number' },
                                            type: { type: 'string' },
                                            name: { type: 'string' },
                                            description: { type: 'string' },
                                            icon: { type: 'string' },
                                            status: { type: 'string' },
                                            disabled: { type: 'number' },
                                            created: { type: 'string', format: 'date-time' },
                                            updated: { type: 'string', format: 'date-time' }
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
    }, applicationHandlers.applicationList);

    fastify.post('/application/create', {
        preHandler: [authenticate],
        schema: {
            description: 'Create new application',
            tags: ['Application'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['type', 'name'],
                properties: {
                    type: { type: 'string', description: 'Application type' },
                    name: { type: 'string', minLength: 1, maxLength: 100, description: 'Application name' },
                    description: { type: 'string', description: 'Application description' },
                    icon: { type: 'string', description: 'Application icon path' },
                    status: { type: 'string', enum: ['processing', 'completed', 'active', 'inactive'], default: 'processing', description: 'Application status' }
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
                                application: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        user_id: { type: 'number' },
                                        type: { type: 'string' },
                                        name: { type: 'string' },
                                        description: { type: 'string' },
                                        icon: { type: 'string' },
                                        status: { type: 'string' },
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
    }, applicationHandlers.createApplication);

    fastify.post('/application/get', {
        preHandler: [authenticate],
        schema: {
            description: 'Get application by ID',
            tags: ['Application'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'number', description: 'Application ID to retrieve' }
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
                            nullable: true,
                            properties: {
                                application: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        user_id: { type: 'number' },
                                        type: { type: 'string' },
                                        name: { type: 'string' },
                                        description: { type: 'string' },
                                        icon: { type: 'string' },
                                        status: { type: 'string' },
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
    }, applicationHandlers.getApplication);

    fastify.post('/application/update', {
        preHandler: [authenticate],
        schema: {
            description: 'Update application information',
            tags: ['Application'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'number', description: 'Application ID to update' },
                    type: { type: 'string', description: 'New application type' },
                    name: { type: 'string', minLength: 1, maxLength: 100, description: 'New application name' },
                    description: { type: 'string', description: 'New application description' },
                    icon: { type: 'string', description: 'New application icon path' },
                    status: { type: 'string', enum: ['processing', 'completed', 'active', 'inactive'], description: 'New application status' },
                    disabled: { type: 'number', enum: [0, 1], description: 'New disabled status' }
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
                            nullable: true,
                            properties: {
                                application: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        user_id: { type: 'number' },
                                        type: { type: 'string' },
                                        name: { type: 'string' },
                                        description: { type: 'string' },
                                        icon: { type: 'string' },
                                        status: { type: 'string' },
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
    }, applicationHandlers.updateApplication);

    fastify.post('/application/delete', {
        preHandler: [authenticate],
        schema: {
            description: 'Delete application',
            tags: ['Application'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'number', description: 'Application ID to delete' }
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
                            nullable: true,
                            properties: {
                                message: { type: 'string' }
                            }
                        }
                    }
                }
            }
        }
    }, applicationHandlers.deleteApplication);

    fastify.post('/application/file-upload', {
        preHandler: [authenticate],
        schema: {
            description: 'Upload file to application',
            tags: ['Application'],
            security: [{ bearerAuth: [] }],
            consumes: ['multipart/form-data'],
            body: {
                type: 'object',
                properties: {
                    application_id: { type: 'number', description: 'Application ID' },
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
                    properties: {
                        code: { type: 'number' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            nullable: true,
                            properties: {
                                file: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        application_id: { type: 'number' },
                                        name: { type: 'string' },
                                        path: { type: 'string' },
                                        size: { type: 'string' },
                                        type: { type: 'string' },
                                        created: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, fileHandlers.fileUpload);

    fastify.post('/application/file-download', {
        preHandler: [authenticate],
        schema: {
            description: 'Download file from application',
            tags: ['Application'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['file_id'],
                properties: {
                    file_id: { type: 'number', description: 'File ID to download' }
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
                            nullable: true,
                            properties: {
                                file: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        name: { type: 'string' },
                                        path: { type: 'string' },
                                        size: { type: 'string' },
                                        type: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, fileHandlers.fileDownload);

    fastify.post('/application/get-files', {
        preHandler: [authenticate],
        schema: {
            description: 'Get application files',
            tags: ['Application'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['application_id'],
                properties: {
                    application_id: { type: 'number', description: 'Application ID' },
                    page_info: {
                        type: 'object',
                        properties: {
                            page: { type: 'number', minimum: 1, default: 1, description: 'Page number' },
                            size: { type: 'number', minimum: 1, maximum: 100, default: 10, description: 'Page size' }
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
                            nullable: true,
                            properties: {
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            application_id: { type: 'number' },
                                            name: { type: 'string' },
                                            path: { type: 'string' },
                                            size: { type: 'string' },
                                            type: { type: 'string' },
                                            created: { type: 'string', format: 'date-time' }
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
    }, fileHandlers.getApplicationFiles);

    fastify.post('/application/delete-file', {
        preHandler: [authenticate],
        schema: {
            description: 'Delete file from application',
            tags: ['Application'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['file_id'],
                properties: {
                    file_id: { type: 'number', description: 'File ID to delete' }
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
                            nullable: true,
                            properties: {
                                message: { type: 'string' }
                            }
                        }
                    }
                }
            }
        }
    }, fileHandlers.deleteFile);
}
