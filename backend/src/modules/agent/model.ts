import { FastifyInstance } from 'fastify';
import { Session } from '../../types/agent';
import { db } from '../../config/database';

export class SessionModel {
    static async create(sessionData: Session & { id?: string }): Promise<Session> {
        const session: Session = {
            id: sessionData.id || crypto.randomUUID(),
            parentId: sessionData.parentId,
            directory: sessionData.directory,
            title: sessionData.title,
            created: sessionData.created || new Date(),
            updated: sessionData.updated || new Date()
        };

        // Use db instance
        await db.insert('sessions', session);
        return session;
    }

    static async findById(id: string): Promise<Session | undefined> {
        const row = await db.selectOne('sessions', 'id = ?', [id]);
        return row ? SessionModel.mapRowToSession(row) : undefined;
    }

    static async findAll(options?: {
        page?: number;
        size?: number;
        filter?: Record<string, any>;
        sort?: Array<{ field: string; order: 'ASC' | 'DESC' }>;
    }): Promise<{ sessions: Session[]; total: number }> {
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
            'sessions',
            whereClause,
            params,
            orderBy,
            options?.page || 1,
            options?.size || 10
        );

        const sessions = items.map(row => SessionModel.mapRowToSession(row));
        return { sessions, total };
    }

    static async update(id: string, updates: Partial<Omit<Session, 'id' | 'created'>>): Promise<Session | undefined> {
        const updateData: Partial<Session> = {
            ...updates,
            updated: new Date()
        };

        await db.update('sessions', updateData, 'id = ?', [id]);
        return SessionModel.findById(id);
    }

    static async delete(id: string): Promise<boolean> {
        const changes = await db.delete('sessions', 'id = ?', [id]);
        return changes > 0;
    }

    private static mapRowToSession(row: any): Session {
        return {
            id: row.id,
            parentId: row.parentId,
            directory: row.directory,
            title: row.title,
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}