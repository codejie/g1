import { FastifyInstance } from 'fastify';
import * as studioHandlers from './handlers.js';
import { authenticate } from '../../middleware/auth.js';

export default async function (fastify: FastifyInstance) {
    fastify.post('/studio/list', {
        preHandler: [authenticate],
        schema: {
            description: 'Get studios list with pagination',
            tags: ['Studio'],
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
                                    name: { type: 'string', description: 'Filter by studio name' },
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
                                            name: { type: 'string' },
                                            description: { type: 'string' },
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
    }, studioHandlers.studioList);

    fastify.post('/studio/create', {
        preHandler: [authenticate],
        schema: {
            description: 'Create new studio',
            tags: ['Studio'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100, description: 'Studio name' },
                    description: { type: 'string', description: 'Studio description' }
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
                                studio: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
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
        }
    }, studioHandlers.createStudio);

    fastify.post('/studio/update', {
        preHandler: [authenticate],
        schema: {
            description: 'Update studio information',
            tags: ['Studio'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'number', description: 'Studio ID to update' },
                    name: { type: 'string', minLength: 1, maxLength: 100, description: 'New studio name' },
                    description: { type: 'string', description: 'New studio description' },
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
                                studio: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
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
        }
    }, studioHandlers.updateStudio);

    fastify.post('/studio/delete', {
        preHandler: [authenticate],
        schema: {
            description: 'Delete studio',
            tags: ['Studio'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'number', description: 'Studio ID to delete' }
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
    }, studioHandlers.deleteStudio);

    fastify.post('/studio/members', {
        preHandler: [authenticate],
        schema: {
            description: 'Get studio members',
            tags: ['Studio'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['studio_id'],
                properties: {
                    studio_id: { type: 'number', description: 'Studio ID' },
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
                                            user_id: { type: 'number' },
                                            studio_id: { type: 'number' },
                                            role: { type: 'string' },
                                            is_default: { type: 'boolean' },
                                            is_owner: { type: 'boolean' },
                                            username: { type: 'string' },
                                            email: { type: 'string' },
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
    }, studioHandlers.getStudioMembers);

    fastify.post('/studio/add-member', {
        preHandler: [authenticate],
        schema: {
            description: 'Add member to studio',
            tags: ['Studio'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['studio_id', 'user_email'],
                properties: {
                    studio_id: { type: 'number', description: 'Studio ID' },
                    user_email: { type: 'string', format: 'email', description: 'User email to add' },
                    role: { type: 'string', enum: ['member', 'admin', 'owner'], default: 'member', description: 'User role' },
                    is_owner: { type: 'boolean', default: false, description: 'Is user an owner' }
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
                                member: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        user_id: { type: 'number' },
                                        studio_id: { type: 'number' },
                                        role: { type: 'string' },
                                        is_default: { type: 'boolean' },
                                        is_owner: { type: 'boolean' },
                                        username: { type: 'string' },
                                        email: { type: 'string' },
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
    }, studioHandlers.addStudioMember);

    fastify.post('/studio/remove-member', {
        preHandler: [authenticate],
        schema: {
            description: 'Remove member from studio',
            tags: ['Studio'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['studio_id', 'user_id'],
                properties: {
                    studio_id: { type: 'number', description: 'Studio ID' },
                    user_id: { type: 'number', description: 'User ID to remove' }
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
    }, studioHandlers.removeStudioMember);
}
