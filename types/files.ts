import type { BaseRequest, BaseResponse } from './common.js'

export type FilesModelType = {
    id?: number;
    user_id: number;
    // skill_id: number
    type: string; // directory, text, image, zip
    path: string;
    name: string;
    // version?: string
    // description?: string
    status: number; // 0: normal; 1: mv fail; 2： removed
    created: Date;
    updated: Date;
}

// download file
// method: POST
// path: /files/download
export interface DownloadRequest extends BaseRequest {
    id: number // file id
}

export type DownloadResult = {
    id: number;
    type: string;
    name: string;
}

export interface DownloadResponse extends BaseResponse<DownloadResult> { }

// get file info
// method: POST
// path: /files/info
export interface GetInfoRequest extends BaseRequest {
    id: number
}

export interface GetInfoResponse extends BaseResponse<FilesModelType> { }