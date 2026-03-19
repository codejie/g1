import type { BaseRequest, BaseResponse } from './common.js';

export type AppsModelType = {
    id?: number; // app id
    user_id: number;
    app_type: number; // default 0
    name: string;
    version?: string;
    description?: string;
    status: number; // default 0, 0: created, 1: completed
    disabled: number;
    created: Date;
    updated: Date;
}

// App's Product Requirements Document Report
export type AppsPrdReportModelType = {
    id?: number;
    skill_id: number; // foreign key of skills
    session_id: number; // foreign key of sessions
    result: number;
    message?: string;
    app_id: number; // foreign key of apps
    file_id: number; // foreign key of files
    created: Date;
    updated: Date;
}

// SSE Event Type of Apps Product Requirements Document Report
export type AppPrdReportSSEType = {
    result: number;
    message?: string;
    app_id: number;
    type?: string; // directory, md, pdf..
    path?: string;
    name?: string;
    file_id?: number;
}

// App's Generation Report
export type AppsGenReportModelType = {
    id?: number;
    skill_id: number;
    session_id: number;
    result: number;
    message?: string;
    app_id: number;
    file_id: number;
    created: Date;
    updated: Date;
}

export type AppGenReportSSEType = {
    result: number;
    message?: string;
    app_id: number;
    type?: string;
    path?: string;
    name?: string;
    file_id?: number;
}

// // App's Project Source Report
// export type AppsProjectReportModelType = {

// }

// // App's Release Package Report
// export type AppsReleaseReportModelType = {

// }

// create app info
// method: POST
// path: /apps/create
export interface CreateReqeust extends BaseRequest {
    app_type: number;
    name: string;
    version?: string;
    description?: string;
}

export interface CreateResponse extends BaseResponse<AppsModelType> { }

// get app info
// method: POST
// path: /apps/info
export interface GetInfoRequest extends BaseRequest {
    id: number;
}

export interface GetAppResponse extends BaseResponse<AppsModelType> { }

// get app list
// method: POST
// path: /apps/list
export interface GetListRequest extends BaseRequest {
    app_type?: number;
}

export interface GetListResponse extends BaseResponse<AppsModelType[]> { }

// get prd report info
// method: POST
// path: /apps/app_prd_report/info
export interface GetPrdReportInfoRequest extends BaseRequest {
    id: number;
}

export interface GetPrdReportInfoResponse extends BaseResponse<AppsPrdReportModelType> { }

export interface GetGenReportInfoRequest extends BaseRequest {
    id: number;
}

export interface GetGenReportInfoResponse extends BaseResponse<AppsGenReportModelType> { }
