import { FastifyInstance } from 'fastify';
import * as userHandlers from './handlers';
import { authenticate } from '../../middleware/auth';

export default async function (fastify: FastifyInstance) {
    // Login
    fastify.post('/user/login', {
        schema: {
            description: 'User login endpoint',
            tags: ['User'],
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', description: 'User email address' },
                    password: { type: 'string', minLength: 6, description: 'User password' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'Login successful',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        data: {
                            type: 'object',
                            properties: {
                                token: { type: 'string', description: 'JWT authentication token' },
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', description: 'User ID' },
                                        email: { type: 'string', description: 'User email' },
                                        name: { type: 'string', description: 'User name' },
                                        status: { type: 'number', description: 'User status (0=active, 1=inactive)' },
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
    }, userHandlers.login);

    // Register
    fastify.post('/user/register', {
        schema: {
            description: 'User registration endpoint',
            tags: ['User'],
            body: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                    email: { type: 'string', format: 'email', description: 'User email address' },
                    password: { type: 'string', minLength: 6, description: 'User password' },
                    name: { type: 'string', minLength: 1, description: 'User display name' }
                }
            },
            response: {
                201: {
                    type: 'object',
                    description: 'Registration successful',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        data: {
                            type: 'object',
                            properties: {
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', description: 'User ID' },
                                        email: { type: 'string', description: 'User email' },
                                        name: { type: 'string', description: 'User name' },
                                        status: { type: 'number', description: 'User status (0=active, 1=inactive)' },
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
    }, userHandlers.register);

    // Get User
    fastify.post('/user/get', {
        preHandler: [authenticate],
        schema: {
            description: 'Get user by ID',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'User ID to retrieve' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'User retrieved successfully',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        data: {
                            type: 'object',
                            properties: {
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', description: 'User ID' },
                                        email: { type: 'string', description: 'User email' },
                                        name: { type: 'string', description: 'User name' },
                                        status: { type: 'number', description: 'User status (0=active, 1=inactive)' },
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
    }, userHandlers.getUser);

    // Get Users List
    fastify.post('/user/list', {
        preHandler: [authenticate],
        schema: {
            description: 'Get users list with pagination',
            tags: ['User'],
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
                    description: 'Users list retrieved successfully',
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
                                            id: { type: 'string', description: 'User ID' },
                                            email: { type: 'string', description: 'User email' },
                                            name: { type: 'string', description: 'User name' },
                                            status: { type: 'number', description: 'User status (0=active, 1=inactive)' },
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
    }, userHandlers.getUsers);

    // Update User
    fastify.post('/user/update', {
        preHandler: [authenticate],
        schema: {
            description: 'Update user information',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'User ID to update' },
                    email: { type: 'string', format: 'email', description: 'New email address' },
                    name: { type: 'string', minLength: 1, description: 'New display name' },
                    password: { type: 'string', minLength: 6, description: 'New password' },
                    status: { type: 'number', enum: [0, 1], description: 'New status (0=active, 1=inactive)' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'User updated successfully',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        data: {
                            type: 'object',
                            properties: {
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', description: 'User ID' },
                                        email: { type: 'string', description: 'User email' },
                                        name: { type: 'string', description: 'User name' },
                                        status: { type: 'number', description: 'User status (0=active, 1=inactive)' },
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
    }, userHandlers.updateUser);

    // Delete User
    fastify.post('/user/delete', {
        preHandler: [authenticate],
        schema: {
            description: 'Delete user by ID',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', description: 'User ID to delete' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'User deleted successfully',
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
    }, userHandlers.deleteUser);
}