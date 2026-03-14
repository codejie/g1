import type { AppsModelType, AppsPrdReportModelType } from '../../types/apps.js';
import db from '../../config/database.js';

export class AppsModel {
    static async create(data: Omit<AppsModelType, 'id' | 'created' | 'updated'>): Promise<AppsModelType> {
        try {
            const insertData: any = {
                user_id: data.user_id,
                app_type: data.app_type,
                name: data.name,
                disabled: data.disabled
            };
            if (data.description !== undefined) {
                insertData.description = data.description;
            }
            const id = await db.insert('apps', insertData);
            const created = await AppsModel.findById(id);
            if (!created) {
                throw new Error('Failed to create app record');
            }
            return created;
        } catch (error: any) {
            throw new Error(`Failed to create app: ${error.message}`);
        }
    }

    static async findById(id: number): Promise<AppsModelType | undefined> {
        try {
            const row = await db.queryOne('SELECT * FROM apps WHERE id = ?', [id]);
            return row ? AppsModel.mapRowToApp(row) : undefined;
        } catch (error: any) {
            throw new Error(`Failed to find app by id: ${error.message}`);
        }
    }

    static async findByUserId(userId: number): Promise<AppsModelType[]> {
        try {
            const rows = await db.queryAll(
                'SELECT * FROM apps WHERE user_id = ? ORDER BY created DESC',
                [userId]
            );
            return rows.map(AppsModel.mapRowToApp);
        } catch (error: any) {
            throw new Error(`Failed to find apps by user id: ${error.message}`);
        }
    }

    static async update(id: number, data: Partial<Omit<AppsModelType, 'id' | 'created' | 'updated'>>): Promise<AppsModelType | undefined> {
        try {
            const updateData: any = {};
            if (data.user_id !== undefined) updateData.user_id = data.user_id;
            if (data.app_type !== undefined) updateData.app_type = data.app_type;
            if (data.name !== undefined) updateData.name = data.name;
            if (data.description !== undefined) updateData.description = data.description;
            if (data.disabled !== undefined) updateData.disabled = data.disabled;
            updateData.updated = new Date().toISOString();

            if (Object.keys(updateData).length === 1) {
                return AppsModel.findById(id);
            }

            await db.update('apps', updateData, 'id = ?', [id]);
            return AppsModel.findById(id);
        } catch (error: any) {
            throw new Error(`Failed to update app: ${error.message}`);
        }
    }

    static async delete(id: number): Promise<boolean> {
        try {
            const result = await db.delete('apps', 'id = ?', [id]);
            return result > 0;
        } catch (error: any) {
            throw new Error(`Failed to delete app: ${error.message}`);
        }
    }

    private static mapRowToApp(row: any): AppsModelType {
        return {
            id: row.id,
            user_id: row.user_id,
            app_type: row.app_type,
            name: row.name,
            description: row.description,
            disabled: row.disabled,
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}

export class AppsPrdReportModel {
    static async create(data: Omit<AppsPrdReportModelType, 'id' | 'created' | 'updated'>): Promise<AppsPrdReportModelType> {
        try {
            const insertData: any = {
                skill_id: data.skill_id,
                session_id: data.session_id,
                app_id: data.app_id,
                result: data.result,
                file_id: data.file_id
            };
            if (data.message !== undefined) {
                insertData.message = data.message;
            }
            const id = await db.insert('apps_prd_report', insertData);
            const created = await AppsPrdReportModel.findById(id);
            if (!created) {
                throw new Error('Failed to create prd report record');
            }
            return created;
        } catch (error: any) {
            throw new Error(`Failed to create prd report: ${error.message}`);
        }
    }

    static async findById(id: number): Promise<AppsPrdReportModelType | undefined> {
        try {
            const row = await db.queryOne('SELECT * FROM apps_prd_report WHERE id = ?', [id]);
            return row ? AppsPrdReportModel.mapRowToPrdReport(row) : undefined;
        } catch (error: any) {
            throw new Error(`Failed to find prd report by id: ${error.message}`);
        }
    }

    static async findByAppId(appId: number): Promise<AppsPrdReportModelType[]> {
        try {
            const rows = await db.queryAll(
                'SELECT * FROM apps_prd_report WHERE app_id = ? ORDER BY created DESC',
                [appId]
            );
            return rows.map(AppsPrdReportModel.mapRowToPrdReport);
        } catch (error: any) {
            throw new Error(`Failed to find prd reports by app id: ${error.message}`);
        }
    }

    static async update(id: number, data: Partial<Omit<AppsPrdReportModelType, 'id' | 'created' | 'updated'>>): Promise<AppsPrdReportModelType | undefined> {
        try {
            const updateData: any = {};
            if (data.skill_id !== undefined) updateData.skill_id = data.skill_id;
            if (data.session_id !== undefined) updateData.session_id = data.session_id;
            if (data.app_id !== undefined) updateData.app_id = data.app_id;
            if (data.result !== undefined) updateData.result = data.result;
            if (data.message !== undefined) updateData.message = data.message;
            if (data.file_id !== undefined) updateData.file_id = data.file_id;
            updateData.updated = new Date().toISOString();

            if (Object.keys(updateData).length === 1) {
                return AppsPrdReportModel.findById(id);
            }

            await db.update('apps_prd_report', updateData, 'id = ?', [id]);
            return AppsPrdReportModel.findById(id);
        } catch (error: any) {
            throw new Error(`Failed to update prd report: ${error.message}`);
        }
    }

    static async delete(id: number): Promise<boolean> {
        try {
            const result = await db.delete('apps_prd_report', 'id = ?', [id]);
            return result > 0;
        } catch (error: any) {
            throw new Error(`Failed to delete prd report: ${error.message}`);
        }
    }

    private static mapRowToPrdReport(row: any): AppsPrdReportModelType {
        return {
            id: row.id,
            skill_id: row.skill_id,
            session_id: row.session_id,
            app_id: row.app_id,
            result: row.result,
            message: row.message,
            file_id: row.file_id,
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}
