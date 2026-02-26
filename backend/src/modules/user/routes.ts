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
        schema: {
            description: 'User logout endpoint',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    token: { type: 'string', description: 'Token to revoke (optional)' }
                }
            },
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
                    username: { type: 'string', minLength: 3, description: 'New username' },
                    email: { type: 'string', format: 'email', description: 'New email address' }
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

    // Reset Password
    fastify.post('/user/reset-password', {
        preHandler: [authenticate],
        schema: {
            description: 'Reset user password',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['newPassword'],
                properties: {
                    email: { type: 'string', format: 'email', description: 'Email address (for reset flow)' },
                    currentPassword: { type: 'string', description: 'Current password (for password change)' },
                    newPassword: { type: 'string', minLength: 6, description: 'New password' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'Password reset successful',
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
    }, userHandlers.resetPassword);

    // Get User Tokens
    fastify.post('/user/tokens', {
        preHandler: [authenticate],
        schema: {
            description: 'Get user tokens',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
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
                    description: 'Tokens retrieved successfully',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        message: { type: 'string', description: 'Response message' },
                        data: {
                            type: 'object',
                            properties: {
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number', description: 'Token ID' },
                                            token: { type: 'string', description: 'Token string' },
                                            expires: { type: 'string', format: 'date-time', description: 'Token expiration time' },
                                            disabled: { type: 'number', description: 'Token status (0=active, 1=disabled)' },
                                            created: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
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
    }, userHandlers.getTokens);

    // Revoke Token
    fastify.post('/user/revoke-token', {
        preHandler: [authenticate],
        schema: {
            description: 'Revoke user token',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['token'],
                properties: {
                    token: { type: 'string', description: 'Token to revoke' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'Token revoked successfully',
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
    }, userHandlers.revokeToken);

    // Get User Studios
    fastify.post('/user/studios', {
        preHandler: [authenticate],
        schema: {
            description: 'Get user studios',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
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
                    description: 'Studios retrieved successfully',
                    properties: {
                        code: { type: 'number', description: 'Response code (0 for success)' },
                        message: { type: 'string', description: 'Response message' },
                        data: {
                            type: 'object',
                            properties: {
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number', description: 'Studio relationship ID' },
                                            user_id: { type: 'number', description: 'User ID' },
                                            studio_id: { type: 'number', description: 'Studio ID' },
                                            role: { type: 'string', description: 'User role in studio' },
                                            is_default: { type: 'boolean', description: 'Is default studio' },
                                            is_owner: { type: 'boolean', description: 'Is studio owner' },
                                            studio_name: { type: 'string', description: 'Studio name' },
                                            created: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, userHandlers.getUserStudios);

    // Switch Studio
    fastify.post('/user/switch-studio', {
        preHandler: [authenticate],
        schema: {
            description: 'Switch default studio',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['studio_id'],
                properties: {
                    studio_id: { type: 'number', description: 'Studio ID to switch to' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'Studio switched successfully',
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
    }, userHandlers.switchStudio);

    // Delete Studio
    fastify.post('/user/delete-studio', {
        preHandler: [authenticate],
        schema: {
            description: 'Leave studio',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['studio_id'],
                properties: {
                    studio_id: { type: 'number', description: 'Studio ID to leave' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'Studio left successfully',
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
    }, userHandlers.deleteStudio);

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
                    id: { type: 'number', description: 'User ID to retrieve' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'User retrieved successfully',
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
                        message: { type: 'string', description: 'Response message' },
                        data: {
                            type: 'object',
                            properties: {
                                items: {
                                    type: 'array',
                                    items: {
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
                    id: { type: 'number', description: 'User ID to update' },
                    username: { type: 'string', minLength: 3, description: 'New username' },
                    email: { type: 'string', format: 'email', description: 'New email address' },
                    password: { type: 'string', minLength: 6, description: 'New password' },
                    disabled: { type: 'number', enum: [0, 1], description: 'New status (0=enabled, 1=disabled)' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'User updated successfully',
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
                    id: { type: 'number', description: 'User ID to delete' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    description: 'User deleted successfully',
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
    }, userHandlers.deleteUser);
}