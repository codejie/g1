import { RESPONSE_CODES } from '../types/common.js';

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: number;

    constructor(statusCode: number, errorCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
    }

    static badRequest(message: string, errorCode: number = RESPONSE_CODES.INVALID_REQUEST) {
        return new ApiError(RESPONSE_CODES.HTTP_BAD_REQUEST, errorCode, message);
    }

    static unauthorized(message: string, errorCode: number = RESPONSE_CODES.UNAUTHORIZED) {
        return new ApiError(RESPONSE_CODES.HTTP_UNAUTHORIZED, errorCode, message);
    }

    static forbidden(message: string, errorCode: number = RESPONSE_CODES.FORBIDDEN) {
        return new ApiError(RESPONSE_CODES.HTTP_FORBIDDEN, errorCode, message);
    }

    static notFound(message: string, errorCode: number = RESPONSE_CODES.NOT_FOUND) {
        return new ApiError(RESPONSE_CODES.HTTP_NOT_FOUND, errorCode, message);
    }

    static conflict(message: string, errorCode: number = RESPONSE_CODES.CONFLICT) {
        return new ApiError(RESPONSE_CODES.HTTP_CONFLICT, errorCode, message);
    }

    static internal(message: string, errorCode: number = RESPONSE_CODES.INTERNAL_ERROR) {
        return new ApiError(RESPONSE_CODES.HTTP_INTERNAL_ERROR, errorCode, message);
    }
}