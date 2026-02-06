import { FastifyInstance } from 'fastify';
import * as ocHandlers from './handlers';
import * as messageHandlers from './message-handlers';
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

    fastify.post('/oc/messages', {
        preHandler: [authenticate],
        schema: {
            description: 'Create a new message',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['session_id', 'message'],
                properties: {
                    session_id: { type: 'string', description: 'Session ID' },
                    message: { type: 'string', description: 'Message content' }
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
                                message: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        user_id: { type: 'number' },
                                        session_id: { type: 'string' },
                                        message: { type: 'string' },
                                        created: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, messageHandlers.createMessage);

    fastify.get('/oc/messages/:id', {
        preHandler: [authenticate],
        schema: {
            description: 'Get a message by ID',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'number' }
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
                                message: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        user_id: { type: 'number' },
                                        session_id: { type: 'string' },
                                        message: { type: 'string' },
                                        created: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, messageHandlers.getMessage);

    fastify.get('/oc/messages', {
        preHandler: [authenticate],
        schema: {
            description: 'List messages',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    session_id: { type: 'string' },
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
                                messages: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            user_id: { type: 'number' },
                                            session_id: { type: 'string' },
                                            message: { type: 'string' },
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
    }, messageHandlers.listMessages);

    fastify.delete('/oc/messages/:id', {
        preHandler: [authenticate],
        schema: {
            description: 'Delete a message',
            tags: ['OpenCode'],
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'number' }
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
                                success: { type: 'boolean' }
                            }
                        }
                    }
                }
            }
        }
    }, messageHandlers.deleteMessage);
}
