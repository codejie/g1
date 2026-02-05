import { FastifyInstance } from 'fastify';
import { File } from '../../types/file';
import { db } from '../../config/database';

export class FileModel {
    static async create(fileData: File & { id?: string }): Promise<File> {
        const file: File = {
            id: fileData.id || crypto.randomUUID(),
            fileName: fileData.fileName,
            filePath: fileData.filePath,
            size: fileData.size,
            mimetype: fileData.mimetype,
            created: fileData.created || new Date(),
            updated: fileData.updated || new Date()
        };

        // Use db instance
        await db.insert('files', file);
        return file;
    }

    static async findById(id: string): Promise<File | undefined> {
        const row = await db.selectOne('files', 'id = ?', [id]);
        return row ? FileModel.mapRowToFile(row) : undefined;
    }

    static async findByFileName(fileName: string): Promise<File | undefined> {
        const row = await db.selectOne('files', 'fileName = ?', [fileName]);
        return row ? FileModel.mapRowToFile(row) : undefined;
    }

    static async findAll(options?: {
        page?: number;
        size?: number;
        filter?: Record<string, any>;
        sort?: Array<{ field: string; order: 'ASC' | 'DESC' }>;
    }): Promise<{ files: File[]; total: number }> {
        let whereClause = '1=1';
        let params: any[] = [];
        
        // Apply filtering
        if (options?.filter) {
            const filterConditions = Object.keys(options.filter).map(key => {
                params.push(`%${options.filter![key]}%`);
                return `${key} LIKE ?`;
            });
            if (filterConditions.length > 0) {
                whereClause = filterConditions.join(' AND ');
            }
        }

        // Apply sorting
        let orderBy = '';
        if (options?.sort && options.sort.length > 0) {
            orderBy = options.sort.map(s => `${s.field} ${s.order}`).join(', ');
        }

        const { items, total } = await db.selectWithPagination(
            'files',
            whereClause,
            params,
            orderBy,
            options?.page || 1,
            options?.size || 10
        );

        const files = items.map(row => FileModel.mapRowToFile(row));
        return { files, total };
    }

    static async update(id: string, updates: Partial<Omit<File, 'id' | 'created'>>): Promise<File | undefined> {
        const updateData: Partial<File> = {
            ...updates,
            updated: new Date()
        };

        await db.update('files', updateData, 'id = ?', [id]);
        return FileModel.findById(id);
    }

    static async delete(id: string): Promise<boolean> {
        const changes = await db.delete('files', 'id = ?', [id]);
        return changes > 0;
    }

    static async deleteByFileName(fileName: string): Promise<boolean> {
        const changes = await db.delete('files', 'fileName = ?', [fileName]);
        return changes > 0;
    }

    private static mapRowToFile(row: any): File {
        return {
            id: row.id,
            fileName: row.fileName,
            filePath: row.filePath,
            size: row.size,
            mimetype: row.mimetype,
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}