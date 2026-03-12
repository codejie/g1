import type { FilesModelType } from '../../types/files.js';
import db from '../../config/database.js';

export class FilesModel {
    /**
     * Create a new file record
     */
    static async create(data: Omit<FilesModelType, 'id' | 'created' | 'updated'>): Promise<FilesModelType> {
        try {
            const insertData: any = {
                user_id: data.user_id,
                type: data.type,
                path: data.path,
                name: data.name,
                status: data.status
            };
            const id = await db.insert('files', insertData);
            const created = await FilesModel.findById(id);
            if (!created) {
                throw new Error('Failed to create file record');
            }
            return created;
        } catch (error: any) {
            throw new Error(`Failed to create file: ${error.message}`);
        }
    }

    /**
     * Find file by id
     */
    static async findById(id: number): Promise<FilesModelType | undefined> {
        try {
            const row = await db.queryOne('SELECT * FROM files WHERE id = ?', [id]);
            return row ? FilesModel.mapRowToFile(row) : undefined;
        } catch (error: any) {
            throw new Error(`Failed to find file by id: ${error.message}`);
        }
    }

    /**
     * Find files by user_id
     */
    static async findByUserId(userId: number): Promise<FilesModelType[]> {
        try {
            const rows = await db.queryAll(
                'SELECT * FROM files WHERE user_id = ? ORDER BY created DESC',
                [userId]
            );
            return rows.map(FilesModel.mapRowToFile);
        } catch (error: any) {
            throw new Error(`Failed to find files by user id: ${error.message}`);
        }
    }

    /**
     * Update file record
     */
    static async update(id: number, data: Partial<Omit<FilesModelType, 'id' | 'created' | 'updated'>>): Promise<FilesModelType | undefined> {
        try {
            const updateData: any = {};
            if (data.user_id !== undefined) updateData.user_id = data.user_id;
            if (data.type !== undefined) updateData.type = data.type;
            if (data.path !== undefined) updateData.path = data.path;
            if (data.name !== undefined) updateData.name = data.name;
            if (data.status !== undefined) updateData.status = data.status;
            updateData.updated = new Date().toISOString();

            if (Object.keys(updateData).length === 0) {
                return FilesModel.findById(id);
            }

            await db.update('files', updateData, 'id = ?', [id]);
            return FilesModel.findById(id);
        } catch (error: any) {
            throw new Error(`Failed to update file: ${error.message}`);
        }
    }

    /**
     * Delete file record
     */
    static async delete(id: number): Promise<boolean> {
        try {
            const result = await db.delete('files', 'id = ?', [id]);
            return result > 0;
        } catch (error: any) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    private static mapRowToFile(row: any): FilesModelType {
        return {
            id: row.id,
            user_id: row.user_id,
            type: row.type,
            path: row.path,
            name: row.name,
            status: row.status,
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}
