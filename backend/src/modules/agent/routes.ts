import { FastifyInstance } from 'fastify';
import * as agentHandlers from './handlers';
import { authenticate } from '../../middleware/auth';

export default async function (fastify: FastifyInstance) {
    // Create Session
    fastify.post('/agent/session/create', {
        preHandler: [authenticate],
        schema: {
            description: 'Create a new session',
            tags: ['Agent', 'Session'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    parentId: { type: 'string', description: 'Parent session ID (optional)' },
                    title: { type: 'string', description: 'Session title' }
                }
            },
            response: {
                201: {
                    type: 'object',
                    description: 'Session created successfully',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        data: {
                            type: 'object',
                            properties: {
                                session: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', description: 'Session ID' },
                                        parentId: { type: 'string', description: 'Parent session ID' },
                                        directory: { type: 'string', description: 'Session directory path' },
                                        title: { type: 'string', description: 'Session title' },
                                        created: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
                                        updated: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, agentHandlers.createSession);

    // Get Session
    fastify.post('/agent/session/get', {
        preHandler: [authenticate],
        schema: {
            description: 'Get session by ID',
            tags: ['Agent', 'Session'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'Session ID to retrieve' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'Session retrieved successfully',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        data: {
                            type: 'object',
                            properties: {
                                session: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', description: 'Session ID' },
                                        parentId: { type: 'string', description: 'Parent session ID' },
                                        directory: { type: 'string', description: 'Session directory path' },
                                        title: { type: 'string', description: 'Session title' },
                                        created: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
                                        updated: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, agentHandlers.getSession);

    // Get Sessions List
    fastify.post('/agent/session/list', {
        preHandler: [authenticate],
        schema: {
            description: 'Get sessions list with pagination',
            tags: ['Agent', 'Session'],
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
                            filter: { type: 'object', description: 'Filter conditions object' }
                        }
                    }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'Sessions list retrieved successfully',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        data: {
                            type: 'object',
                            properties: {
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string', description: 'Session ID' },
                                            parentId: { type: 'string', description: 'Parent session ID' },
                                            directory: { type: 'string', description: 'Session directory path' },
                                            title: { type: 'string', description: 'Session title' },
                                            created: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
                                            updated: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
                                        }
                                    }
                                },
                                page_info: {
                                    type: 'object',
                                    properties: {
                                        page: { type: 'number', description: 'Current page number' },
                                        size: { type: 'number', description: 'Page size' },
                                        total: { type: 'number', description: 'Total number of items' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, agentHandlers.getSessions);

    // Update Session
    fastify.post('/agent/session/update', {
        preHandler: [authenticate],
        schema: {
            description: 'Update session information',
            tags: ['Agent', 'Session'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'Session ID to update' },
                    parentId: { type: 'string', description: 'New parent session ID' },
                    directory: { type: 'string', description: 'New directory path' },
                    title: { type: 'string', description: 'New session title' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'Session updated successfully',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        data: {
                            type: 'object',
                            properties: {
                                session: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', description: 'Session ID' },
                                        parentId: { type: 'string', description: 'Parent session ID' },
                                        directory: { type: 'string', description: 'Session directory path' },
                                        title: { type: 'string', description: 'Session title' },
                                        created: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
                                        updated: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, agentHandlers.updateSession);

    // Delete Session
    fastify.post('/agent/session/delete', {
        preHandler: [authenticate],
        schema: {
            description: 'Delete session by ID',
            tags: ['Agent', 'Session'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'Session ID to delete' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'Session deleted successfully',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        data: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', description: 'Success message' }
                            }
                        }
                    }
                }
            }
        }
    }, agentHandlers.deleteSession);
}