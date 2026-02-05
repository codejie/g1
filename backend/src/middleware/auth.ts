import { FastifyRequest, FastifyReply } from 'fastify';
import { Response, RESPONSE_CODES } from '../types/common';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'supersecret'; // Must match the secret in user.handlers.ts

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
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // You might want to attach the decoded user info to the request object
        // request.user = decoded as { id: string; email: string }; // This would require type augmentation for FastifyRequest
        
        return; // Success case - continue to the handler

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