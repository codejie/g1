import { FastifyInstance } from 'fastify';
import * as userHandlers from './handlers.js';
import { authenticate } from '../../middleware/auth.js';

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
                        message: { type: 'string', description: 'Response message' },
                        data: {
                            type: 'object',
                            properties: {
                                token: { type: 'string', description: 'JWT authentication token' },
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number', description: 'User ID' },
                                        username: { type: 'string', description: 'User username' },
                                        email: { type: 'string', description: 'User email' },
                                        disabled: { type: 'number', description: 'User status (0=enabled, 1=disabled)' },
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

    // Logout
    fastify.post('/user/logout', {
        preHandler: [authenticate],
        schema: {
            description: 'User logout endpoint',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    description: 'Logout successful',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        message: { type: 'string', description: 'Response message' },
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
    }, userHandlers.logout);

    // Register
    fastify.post('/user/register', {
        schema: {
            description: 'User registration endpoint',
            tags: ['User'],
            body: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                    username: { type: 'string', minLength: 3, description: 'User username' },
                    email: { type: 'string', format: 'email', description: 'User email address' },
                    password: { type: 'string', minLength: 6, description: 'User password' },
                    name: { type: 'string', minLength: 1, description: 'User display name (optional)' }
                }
            },
            response: {
                201: {
                    type: 'object',
                    description: 'Registration successful',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        message: { type: 'string', description: 'Response message' },
                        data: {
                            type: 'object',
                            properties: {
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number', description: 'User ID' },
                                        username: { type: 'string', description: 'User username' },
                                        email: { type: 'string', description: 'User email' },
                                        disabled: { type: 'number', description: 'User status (0=enabled, 1=disabled)' },
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

    // Get User Profile
    fastify.post('/user/profile', {
        preHandler: [authenticate],
        schema: {
            description: 'Get current user profile',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    description: 'Profile retrieved successfully',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        message: { type: 'string', description: 'Response message' },
                        data: {
                            type: 'object',
                            properties: {
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number', description: 'User ID' },
                                        username: { type: 'string', description: 'User username' },
                                        email: { type: 'string', description: 'User email' },
                                        disabled: { type: 'number', description: 'User status (0=enabled, 1=disabled)' },
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
    }, userHandlers.getProfile);

    // Update User Profile
    fastify.post('/user/set-profile', {
        preHandler: [authenticate],
        schema: {
            description: 'Update user profile',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    username: { type: 'string', minLength: 3, description: 'New username (optional)' },
                    email: { type: 'string', format: 'email', description: 'New email address (optional)' },
                    name: { type: 'string', description: 'Display name (optional)' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'Profile updated successfully',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        message: { type: 'string', description: 'Response message' },
                        data: {
                            type: 'object',
                            properties: {
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number', description: 'User ID' },
                                        username: { type: 'string', description: 'User username' },
                                        email: { type: 'string', description: 'User email' },
                                        disabled: { type: 'number', description: 'User status (0=enabled, 1=disabled)' },
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
    }, userHandlers.updateProfile);
}
