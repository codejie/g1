import type { Request, Response } from './common.js'

// Session types based on OpenCode API
export type OCSessionType = 0 | 1 | 2 // 0/general, 1/coding, 2/debugging
export type OCAppType = 0 | 1 | 2 | 3 // 0/web, 1/android, 2/ios, 3/mobile

export type OCSessionResponse = {
    session_id: number
    type: OCSessionType
    title?: string
    skill_id?: number
    items?: SessionMessageItem[]
}

// Database model type for OC Session
export type OCSession = {
    id: number
    user_id: number
    session_id: string
    parent_id?: string
    directory?: string
    title?: string
    type: number
    skill_id: number
    disabled: number
    created: Date
}

// Create Session
export interface CreateOCSessionRequest extends Request {
    type?: OCSessionType
    title?: string
    extra?: Record<string, any>
}

export interface CreateOCSessionResponse extends Response {
    data: OCSessionResponse
}

// Update Session
export interface UpdateOCSessionRequest extends Request {
    session_id: number
    type?: OCSessionType
    app_type?: OCAppType
    extra?: Record<string, any>
}

export interface UpdateOCSessionResponse extends Response {
    data: OCSessionResponse
}

// Session Message
export interface SendSessionMessageRequest extends Request {
    session_id: number
    type: string
    content: string
    extra?: Record<string, any>
}

export type SessionMessageItem = {
    id: string // original message id
    role: string // "user", "assistant", "system", etc.
    type: string
    content: string
    created: string
}

export type SessionMessageResponse = {
    session_id: number
    skill_id?: number
    items: SessionMessageItem[]
}

export interface SendSessionMessageResponse extends Response {
    data: SessionMessageResponse
}

// Skills Callback
export interface SkillsCallbackRequest extends Request {
    session_id: string
    skill_id: number
    event: string
    type?: string
    data?: any
}

export interface SkillsCallbackResponse extends Response {
    code: number
    message?: string
    result?: any
}

// Question Reply
export interface QuestionReplyRequest extends Request {
    session_id: number
    question_id: string
    message_id?: string
    call_id?: string
    result?: string
    content?: string
    extra?: Record<string, any>
}

export interface QuestionReplyResponse extends Response {
    code: number
    message?: string
    result?: any
}

// Database model type for OC Skill Callback
export type OCSkillCallback = {
    id: number
    skill_id: string
    session_id: string
    event: string
    type: string
    data: any
    created: Date
}

// SSE Event types
export type SSEEventType = 'update' | 'finish' | 'error'

export type SSEEvent = {
    // type: SSEEventType
    session_id: number
    skill_id: number
    skill_name: string
    type?: string
    data?: any
}

export interface SSERequest extends Request {
    session_id: number
}
