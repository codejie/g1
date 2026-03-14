import type { BaseRequest, BaseResponse } from './common.js';

export type AppsModelType = {
    id?: number, // app id
    user_id: number,
    app_type: number, // default 0
    name: string,
    description?: string,
    disabled: number,
    created: Date,
    updated: Date
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

// App's Project Source Report
export type AppsProjectReportModelType = {

}

// App's Release Package Report
export type AppsReleaseReportModelType = {
    
}

// get app info
// method: POST
// path: /apps/info
export interface GetInfoRequest extends BaseRequest {
    id: number;
}

export interface GetAppResponse extends BaseResponse<AppsModelType> {}

// get prd report info
// method: POST
// path: /apps/prd_report/info
export interface GetPrdReportInfoRequest extends BaseRequest {
    id: number;
}

export interface GetPrdReportInfoResponse extends BaseResponse<AppsPrdReportModelType> {}
