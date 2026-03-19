import { AppsPrdReportModel, AppsGenReportModel, AppsModel } from '../apps/model.js';
import { FilesModel } from '../files/model.js';
import { AppPrdReportSSEType, AppGenReportSSEType } from '../../types/apps.js';

export async function handleAppPrdReportCallback(
    user_id: number,
    skill_id: number,
    session_id: number,
    data?: any
): Promise<AppPrdReportSSEType | null> {
    console.log('[SkillsCallback] Handling app_prd_report event:', { user_id, skill_id, session_id, data });

    const appId = data?.app_id ?? 1;
    const result = data?.result ?? 0;
    const message = data?.message;

    if (!appId) {
        console.error('[SkillsCallback] Missing required field: app_id');
        return null;
    }

    try {
        const fileType = data?.type || 'app_prd_report';
        const filePath = data?.path || '';
        const fileName = data?.name || `prd_report_${Date.now()}.md`;

        const file = await FilesModel.create({
            user_id,
            type: fileType,
            path: filePath,
            name: fileName,
            status: 0
        });

        const prdReport = await AppsPrdReportModel.create({
            skill_id,
            session_id: session_id,
            app_id: appId,
            result,
            message,
            file_id: file.id!
        });
        console.log('[SkillsCallback] PRD report created:', prdReport.id);

        return {
            result,
            message,
            app_id: appId,
            type: fileType,
            path: filePath,
            name: fileName,
            file_id: file.id
        };
    } catch (error: any) {
        console.error('[SkillsCallback] Failed to create PRD report:', error.message);
        return null;
    }
}

export async function handleAppGenReportCallback(
    user_id: number,
    skill_id: number,
    session_id: number,
    data?: any
): Promise<AppGenReportSSEType | null> {
    console.log('[SkillsCallback] Handling app_gen_report event:', { user_id, skill_id, session_id, data });

    const appId = data?.app_id ?? 1;
    const result = data?.result ?? 0;
    const message = data?.message;

    if (!appId) {
        console.error('[SkillsCallback] Missing required field: app_id');
        return null;
    }

    try {
        const fileType = data?.type || 'app_gen_report';
        const filePath = data?.path;
        const fileName = data?.name;

        const file = await FilesModel.create({
            user_id,
            type: fileType,
            path: filePath,
            name: fileName,
            status: 0
        });

        const genReport = await AppsGenReportModel.create({
            skill_id,
            session_id: session_id,
            app_id: appId,
            result,
            message,
            file_id: file.id!
        });
        console.log('[SkillsCallback] Gen report created:', genReport.id);

        await AppsModel.update(appId, { status: 1 });

        return {
            result,
            message,
            app_id: appId,
            type: fileType,
            path: filePath,
            name: fileName,
            file_id: file.id
        };
    } catch (error: any) {
        console.error('[SkillsCallback] Failed to create gen report:', error.message);
        return null;
    }
}

export async function handleReleaseReportCallback(
    user_id: number,
    skill_id: number,
    session_id: number,
    data?: any
): Promise<void> {
    console.log('[SkillsCallback] Handling release_report event:', { user_id, skill_id, session_id, data });
}

export async function handleSkillsCallback(
    user_id: number,
    skill_id: number,
    session_id: number,
    event: string,
    data?: any
): Promise<any> {
    switch (event) {
        case 'app_prd_report':
        case 'result_with_file':
            return await handleAppPrdReportCallback(user_id, skill_id, session_id, data);
        case 'app_gen_report':
            return await handleAppGenReportCallback(user_id, skill_id, session_id, data);
        case 'release_report':
            return await handleReleaseReportCallback(user_id, skill_id, session_id, data);
        default:
            console.log('[SkillsCallback] Unknown event type:', event);
            return null;
    }
}
