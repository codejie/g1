import { Studio, StudioMember } from '../../types/studio';
import { db } from '../../config/database';

export class StudioModel {
    static async create(data: Omit<Studio, 'id' | 'created' | 'updated'>): Promise<Studio> {
        const id = await db.insert('studios', data);
        const studio: Studio = {
            id,
            ...data,
            created: new Date(),
            updated: new Date()
        };

        return studio;
    }

    static async findById(id: number): Promise<Studio | undefined> {
        const row = await db.selectOne('studios', 'id = ?', [id]);
        return row ? StudioModel.mapRowToStudio(row) : undefined;
    }

    static async findByName(name: string): Promise<Studio | undefined> {
        const row = await db.selectOne('studios', 'name = ?', [name]);
        return row ? StudioModel.mapRowToStudio(row) : undefined;
    }

    static async findAll(options?: {
        page?: number;
        size?: number;
        filter?: Record<string, any>;
        sort?: Array<{ field: string; order: 'ASC' | 'DESC' }>;
    }): Promise<{ studios: Studio[]; total: number }> {
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
            'studios',
            whereClause,
            params,
            orderBy,
            options?.page || 1,
            options?.size || 10
        );

        const studios = items.map(StudioModel.mapRowToStudio);
        return { studios, total };
    }

    static async update(id: number, data: Partial<Omit<Studio, 'id' | 'created'>>): Promise<Studio | undefined> {
        const updateData: Partial<Studio> = {
            ...data,
            updated: new Date()
        };

        const affectedRows = await db.update('studios', updateData, 'id = ?', [id]);
        if (affectedRows === 0) {
            return undefined;
        }

        return await StudioModel.findById(id);
    }

    static async delete(id: number): Promise<boolean> {
        const deletedRows = await db.delete('studios', 'id = ?', [id]);
        return deletedRows > 0;
    }

    private static mapRowToStudio(row: any): Studio {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            disabled: row.disabled,
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}

export class StudioMemberModel {
    static async addMember(data: {
        user_id: number;
        studio_id: number;
        role: string;
        is_default?: boolean;
        is_owner?: boolean;
    }): Promise<StudioMember> {
        // Check if user is already a member
        const existing = await db.selectOne('user_studios', 'user_id = ? AND studio_id = ?', [data.user_id, data.studio_id]);
        if (existing) {
            throw new Error('User is already a member of this studio');
        }

        const id = await db.insert('user_studios', data);
        const memberRow = await db.queryOne(`
            SELECT us.*, u.username, u.email 
            FROM user_studios us 
            JOIN users u ON us.user_id = u.id 
            WHERE us.id = ?
        `, [id]);

        return StudioMemberModel.mapRowToStudioMember(memberRow);
    }

    static async findByStudioId(studioId: number): Promise<StudioMember[]> {
        const rows = await db.queryAll(`
            SELECT us.*, u.username, u.email 
            FROM user_studios us 
            JOIN users u ON us.user_id = u.id 
            WHERE us.studio_id = ?
        `, [studioId]);

        return rows.map(StudioMemberModel.mapRowToStudioMember);
    }

    static async findByUserIdStudioId(userId: number, studioId: number): Promise<StudioMember | undefined> {
        const row = await db.queryOne(`
            SELECT us.*, u.username, u.email 
            FROM user_studios us 
            JOIN users u ON us.user_id = u.id 
            WHERE us.user_id = ? AND us.studio_id = ?
        `, [userId, studioId]);

        return row ? StudioMemberModel.mapRowToStudioMember(row) : undefined;
    }

    static async updateMember(userId: number, studioId: number, data: {
        role?: string;
        is_owner?: boolean;
    }): Promise<boolean> {
        const updateData = {
            ...data,
            updated: new Date()
        };

        const affectedRows = await db.update('user_studios', updateData, 'user_id = ? AND studio_id = ?', [userId, studioId]);
        return affectedRows > 0;
    }

    static async removeMember(userId: number, studioId: number): Promise<boolean> {
        const deletedRows = await db.delete('user_studios', 'user_id = ? AND studio_id = ?', [userId, studioId]);
        return deletedRows > 0;
    }

    private static mapRowToStudioMember(row: any): StudioMember {
        return {
            id: row.id,
            user_id: row.user_id,
            studio_id: row.studio_id,
            role: row.role,
            is_default: Boolean(row.is_default),
            is_owner: Boolean(row.is_owner),
            created: new Date(row.created),
            updated: new Date(row.updated),
            username: row.username,
            email: row.email
        };
    }
}