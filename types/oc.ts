import type { BaseRequest, BaseResponse } from './common.js'


export type SessionType = 0 | 1 | 2; // 0/general, 1/coding, 2/debugging 
export type MessageType = 'text' | 'part';
export type QuestionResult = 'reply' | 'reject';
export type SkillsCallbackEvent = 'app_prd_report' | 'app_gen_report' | 'release_report';
// export type SkillsCallbackType = 'file' | 'unknown';

// Session create
// method: POST
// path: /oc/session/create
export interface SessionCreateRequest extends BaseRequest {
    type: SessionType;
    title?: string;
    extra?: Record<string, any>
}

export type SessionCreateResult = {
    id: number;
    type: SessionType;
    title: string;
    skill_id?: number;
    skill_name?: number;
    message_type?: MessageType;
    message_content?: any;
}

export interface SessionCreateResponse extends BaseResponse<SessionCreateResult> { }

// Session SSE subscribe
// method: GET
// path: /oc/session/sse
export interface SessionSSESubscribeRequest extends BaseRequest {
    session_id: number;
}

export type SessionSSESubscribeResult = {
    event: string;
    message_type?: MessageType;
    message_content?: any;
}

export interface SessionSSESubscribeResponse extends BaseResponse<SessionSSESubscribeResult> { }

// Session Message Async
// method: POST
// path: /oc/session/message/async
export interface SessionMessageAsyncRequest extends BaseRequest {
    session_id: number;
    message_type: MessageType;
    message_content: any
}

export interface SessionMessageAsyncResponse extends BaseResponse { }

// Session Skill Active
// method: POST
// path: /oc/session/skill_active
export interface SessionSkillActiveRequest extends BaseRequest {
    session_id: number;
    skill_type: number;
    extra?: Record<string, any>
}

export type SessionSkillActiveResult = {
    skill_id: number;
    skill_name: string;
    message_type?: MessageType;
    message_content?: any;
}

export interface SessionSkillActiveResponse extends BaseResponse<SessionSkillActiveResult> { }

// Session Message Question
// method: POST
// path: /oc/session/tool/question
export interface SessionMessageQuestionRequest extends BaseRequest {
    session_id: number;
    question_id: string;
    message_id?: string;
    call_id?: string;
    result?: QuestionResult;
    message_type?: MessageType;
    message_content?: any;
}

export interface SessionMessageQuestionResponse extends BaseResponse { }

// Skills Callback
export interface SkillsCallbackRequest extends BaseRequest {
    user_id: number;
    skill_id: number;
    session_id: string; // oc session id
    event: SkillsCallbackEvent; // event type
    // type?: SkillsCallbackType;
    data?: any;
}