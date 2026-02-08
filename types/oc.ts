import type { Request, Response } from './common'

// Session types based on OpenCode API
export type OCSessionType = 0 | 1 | 2 // 0/general, 1/coding, 2/debugging
export type OCAppType = 0 | 1 | 2 | 3 // 0/web, 1/android, 2/ios, 3/mobile

export type OCSessionResponse = {
    session_id: number
    type: OCSessionType
    title: string
    agent_id?: number
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
    agent_id: number
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
    agent_id?: number
    items: SessionMessageItem[]
}

export interface SendSessionMessageResponse extends Response {
    data: SessionMessageResponse
}

// Skills Callback
export interface SkillsCallbackRequest extends Request {
    skill_id: string
    skill_version: string
    session_id: number
    type: string
    data: any
}

export interface SkillsCallbackResponse extends Response {
    code: number
    message?: string
    result?: any
}

// Database model type for OC Skill Callback
export type OCSkillCallback = {
    id: number
    skill_id: string
    skill_version: string
    session_id: number
    type: string
    data: any
    created: Date
}

// SSE Event types
export type SSEEventType = 'message' | 'skill_update' | 'session_update' | 'error' | 'complete'

export type SSEEvent = {
    type: SSEEventType
    session_id: number
    agent_id?: number
    skill_id?: string
    data: any
    timestamp: string
}

export interface SSERequest extends Request {
    session_id: number
    agent_id?: number
    skill_id?: string
}
