import { AppsPrdReportModel } from '../apps/model.js';
import { FilesModel } from '../files/model.js';

export async function handlePrdReportCallback(
    user_id: number,
    skill_id: number,
    session_id: number,
    data?: any
): Promise<void> {
    console.log('[SkillsCallback] Handling prd_report event:', { user_id, skill_id, session_id, data });

    const appId = data?.app_id ?? 1;
    const result = data?.result ?? 0;
    const message = data?.message;

    if (!appId) {
        console.error('[SkillsCallback] Missing required field: app_id');
        return;
    }

    try {
        const fileType = data?.type || 'prd_report';
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
    } catch (error: any) {
        console.error('[SkillsCallback] Failed to create PRD report:', error.message);
    }
}

export async function handleAppReportCallback(
    user_id: number,
    skill_id: number,
    session_id: number,
    data?: any
): Promise<void> {
    console.log('[SkillsCallback] Handling app_report event:', { user_id, skill_id, session_id, data });
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
): Promise<void> {
    switch (event) {
        case 'prd_report':
        case 'result_with_file':
            await handlePrdReportCallback(user_id, skill_id, session_id, data);
            break;
        case 'app_report':
            await handleAppReportCallback(user_id, skill_id, session_id, data);
            break;
        case 'release_report':
            await handleReleaseReportCallback(user_id, skill_id, session_id, data);
            break;
        default:
            console.log('[SkillsCallback] Unknown event type:', event);
    }
}
