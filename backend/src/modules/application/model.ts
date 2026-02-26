import { Application, AppFile } from '../../types/application.js';
import { db } from '../../config/database.js';

export class ApplicationModel {
    static async create(data: Omit<Application, 'id' | 'created' | 'updated'>): Promise<Application> {
        const id = await db.insert('applications', data);
        const application: Application = {
            id,
            ...data,
            created: new Date(),
            updated: new Date()
        };

        return application;
    }

    static async findById(id: number): Promise<Application | undefined> {
        const row = await db.selectOne('applications', 'id = ?', [id]);
        return row ? ApplicationModel.mapRowToApplication(row) : undefined;
    }

    static async findByUserId(userId: number): Promise<Application[]> {
        const rows = await db.selectAllFrom('applications', 'user_id = ?', 'updated DESC', [userId]);
        return rows.map(ApplicationModel.mapRowToApplication);
    }

    static async findAll(options?: {
        page?: number;
        size?: number;
        filter?: Record<string, any>;
        sort?: Array<{ field: string; order: 'ASC' | 'DESC' }>;
    }): Promise<{ applications: Application[]; total: number }> {
        let whereClause = '1=1';
        let params: any[] = [];
        let orderBy = '';

        // Apply filtering
        if (options?.filter) {
            const filterConditions: string[] = [];
            Object.keys(options.filter).forEach(key => {
                params.push(`%${options.filter![key]}%`);
                filterConditions.push(`${key} LIKE ?`);
            });
            if (filterConditions.length > 0) {
                whereClause = filterConditions.join(' AND ');
            }
        }

        // Apply sorting
        if (options?.sort && options.sort.length > 0) {
            const sortClauses = options.sort.map(s => `${s.field} ${s.order}`);
            orderBy = sortClauses.join(', ');
        }

        const { items, total } = await db.selectWithPagination(
            'applications',
            whereClause,
            params,
            orderBy,
            options?.page || 1,
            options?.size || 10
        );

        const applications = items.map(ApplicationModel.mapRowToApplication);
        return { applications, total };
    }

    static async update(id: number, data: Partial<Omit<Application, 'id' | 'created'>>): Promise<Application | undefined> {
        const updateData: Partial<Application> = {
            ...data,
            updated: new Date()
        };

        const affectedRows = await db.update('applications', updateData, 'id = ?', [id]);
        if (affectedRows === 0) {
            return undefined;
        }

        return await ApplicationModel.findById(id);
    }

    static async delete(id: number): Promise<boolean> {
        const deletedRows = await db.delete('applications', 'id = ?', [id]);
        return deletedRows > 0;
    }

    private static mapRowToApplication(row: any): Application {
        return {
            id: row.id,
            user_id: row.user_id,
            type: row.type,
            name: row.name,
            description: row.description,
            icon: row.icon,
            status: row.status,
            disabled: row.disabled,
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}

export class AppFileModel {
    static async create(data: Omit<AppFile, 'id' | 'created' | 'updated'>): Promise<AppFile> {
        const id = await db.insert('app_files', data);
        const appFile: AppFile = {
            id,
            ...data,
            created: new Date(),
            updated: new Date()
        };

        return appFile;
    }

    static async findById(id: number): Promise<AppFile | undefined> {
        const row = await db.selectOne('app_files', 'id = ?', [id]);
        return row ? AppFileModel.mapRowToAppFile(row) : undefined;
    }

    static async findByApplicationId(applicationId: number): Promise<AppFile[]> {
        const rows = await db.selectAllFrom('app_files', 'application_id = ?', 'updated DESC', [applicationId]);
        return rows.map(AppFileModel.mapRowToAppFile);
    }

    static async findByUserId(userId: number): Promise<AppFile[]> {
        const rows = await db.selectAllFrom('app_files', 'user_id = ?', 'updated DESC', [userId]);
        return rows.map(AppFileModel.mapRowToAppFile);
    }

    static async update(id: number, data: Partial<Omit<AppFile, 'id' | 'created'>>): Promise<AppFile | undefined> {
        const updateData: Partial<AppFile> = {
            ...data,
            updated: new Date()
        };

        const affectedRows = await db.update('app_files', updateData, 'id = ?', [id]);
        if (affectedRows === 0) {
            return undefined;
        }

        return await AppFileModel.findById(id);
    }

    static async delete(id: number): Promise<boolean> {
        const deletedRows = await db.delete('app_files', 'id = ?', [id]);
        return deletedRows > 0;
    }

    private static mapRowToAppFile(row: any): AppFile {
        return {
            id: row.id,
            user_id: row.user_id,
            application_id: row.application_id,
            name: row.name,
            path: row.path,
            size: BigInt(row.size),
            type: row.type,
            disabled: row.disabled,
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}