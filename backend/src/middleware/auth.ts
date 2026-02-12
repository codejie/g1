import { FastifyRequest, FastifyReply } from 'fastify';
import { Response, RESPONSE_CODES } from '../types/common';
import jwt from 'jsonwebtoken';
import config from '../config';

const JWT_SECRET = config.JWT_SECRET; // Must match secret in user.handlers.ts

// Type augmentation for FastifyRequest
declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: number;
            username: string;
            email: string;
        };
    }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const response: Response = {
                code: RESPONSE_CODES.UNAUTHORIZED,
                data: {
                    message: 'No token provided'
                }
            };
            return reply.code(RESPONSE_CODES.HTTP_OK).send(response);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Attach user info to request object
        request.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email
        };

        return; // Success case - continue to handler

    } catch (err: any) {
        const response: Response = {
            code: RESPONSE_CODES.UNAUTHORIZED,
            data: {
                message: err.message || 'Unauthorized'
            }
        };
        return reply.code(RESPONSE_CODES.HTTP_OK).send(response);
    }
}

// Studio owner authorization middleware
export async function requireStudioOwner(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
        const response: Response = {
            code: RESPONSE_CODES.UNAUTHORIZED,
            data: {
                message: 'Authentication required'
            }
        };
        return reply.code(RESPONSE_CODES.HTTP_OK).send(response);
    }

    // Studio owner check will be implemented in studio module
    // This is a placeholder middleware that can be used for additional authorization
    return;
}

// Studio member authorization middleware
export async function requireStudioMember(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
        const response: Response = {
            code: RESPONSE_CODES.UNAUTHORIZED,
            data: {
                message: 'Authentication required'
            }
        };
        return reply.code(RESPONSE_CODES.HTTP_OK).send(response);
    }

    // Studio member check will be implemented in studio module
    // This is a placeholder middleware that can be used for additional authorization
    return;
}