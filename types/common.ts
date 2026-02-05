export type PageInfo = {
    page: number;
    size: number;
    total: number;
}

export type SortInfo = {
    field: string;
    order: 'ASC' | 'DESC'; // ASC or DESC
}

export type Sort = SortInfo; // For backward compatibility

export interface Request {}

export interface Error {
    code: number;
    message: string;
}

export interface Response {
    code: number;
    data?: any;
}

export type PaginationRequest = Request & {
    page_info?: {
        page?: number;
        size?: number;
        sort?: SortInfo[];
        filter?: Record<string, any>;
    };
}

export type ListResult<T> = {
    items: T[];
    page_info: PageInfo;
}

// Response code constants for business logic results
export const RESPONSE_CODES = {
    // Success codes
    SUCCESS: 0,
    
    // General error codes  
    INVALID_REQUEST: -1,
    VALIDATION_ERROR: -2,
    UNAUTHORIZED: -3,
    FORBIDDEN: -4,
    NOT_FOUND: -5,
    CONFLICT: -6,
    INTERNAL_ERROR: -7,
    
    // User module specific codes
    USER_NOT_FOUND: -100,
    USER_ALREADY_EXISTS: -101,
    INVALID_CREDENTIALS: -102,
    INVALID_PASSWORD: -103,
    
    // Session module specific codes  
    SESSION_NOT_FOUND: -200,
    
    // File module specific codes
    FILE_NOT_FOUND: -300,
    NO_FILE_UPLOADED: -301,
    INVALID_MULTIPART_REQUEST: -302,
    
    // HTTP status code mapping (for backward compatibility)
    HTTP_OK: 200,
    HTTP_CREATED: 201,
    HTTP_BAD_REQUEST: 400,
    HTTP_UNAUTHORIZED: 401,
    HTTP_FORBIDDEN: 403,
    HTTP_NOT_FOUND: 404,
    HTTP_CONFLICT: 409,
    HTTP_INTERNAL_ERROR: 500
} as const;

export type ResponseCode = typeof RESPONSE_CODES[keyof typeof RESPONSE_CODES];
