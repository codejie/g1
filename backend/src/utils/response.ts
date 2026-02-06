import { FastifyReply } from 'fastify';
import { RESPONSE_CODES } from '../types/common';

export function sendSuccess(reply: FastifyReply, data: any, message: string = 'Success', httpCode: number = RESPONSE_CODES.HTTP_OK): void {
    const response = {
        code: RESPONSE_CODES.SUCCESS,
        message,
        data
    };
    reply.code(httpCode).send(response);
}

export function sendError(reply: FastifyReply, code: number, message: string, httpCode: number = RESPONSE_CODES.HTTP_OK): void {
    const response = {
        code,
        message,
        data: undefined
    };
    reply.code(httpCode).send(response);
}