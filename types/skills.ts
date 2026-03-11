import type { BaseRequest, BaseResponse } from "./common.js";

export type Skill = {
    id: number;
    type: number;
    name: string;
    version: string;
    description?: string;
    extra_arguments?: string;
    disabled: number; // 0: enabled, 1: disabled
    created: Date;
    updated: Date;
};

// create
// method: POST
// path: /skill/create
export interface SkillCreateRequest extends BaseRequest {
    type: number;
    name: string;
    version: string;
    description: string;
    extra_arguments: string;
};

export type SkillCreateResult = {
    id: number
}

export interface SkillCreateResponse extends BaseResponse<SkillCreateResult> { }

// update
// method: POST
// path: /skill/update
export interface SkillUpdateRequest extends BaseRequest {
    id: number;
    type?: number;
    name?: string;
    version?: string;
    description?: string;
    extra_arguments?: string;
    disabled?: number;
};

export type SkillUpdateResult = {
    id: number
}

export interface SkillUpdateResponse extends BaseResponse<SkillUpdateResult> { }

// delete
// method: POST
// path: /skill/delete
export type SkillDeleteRequest = BaseRequest & {
    id: number;
};

export interface SkillDeleteResponse extends BaseResponse { }

// list
// method: POST
// path: /skill/list
export interface SkillListRequest extends BaseRequest {
    type?: number;
}

export type SkillListResult = {
    items: Skill[]
}

export interface SkillListResponse extends BaseResponse<SkillListResult> { }

// find by type
// method: POST
// path: /skill/find_by_type
export interface SkillFindByTypeRequest extends BaseRequest {
    type: number;
}

export type SkillFindByTypeResult = Skill[];

export interface SkillFindByTypeResponse extends BaseResponse<SkillFindByTypeResult> { }

// find by id
// method: POST
// path: /skill/find_by_id
export interface SkillFindByIdRequest extends BaseRequest {
    id: number;
}

export type SkillFindByIdResult = Skill;

export interface SkillFindByIdResponse extends BaseResponse<SkillFindByIdResult> { }
