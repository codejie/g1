import { OCSession } from '../../types/oc';
import { db } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

export class OCSessionModel {
    static async create(data: Omit<OCSession, 'id' | 'created' | 'updated' | 'session_id'>): Promise<OCSession> {
        const sessionId = uuidv4();
        
        // Disable previous sessions for this user
        await db.update('oc_sessions', { disabled: 1, updated: new Date() }, 'user_id = ? AND disabled = 0', [data.user_id]);

        const ocSession: Omit<OCSession, 'id' | 'created' | 'updated'> = {
            user_id: data.user_id,
            session_id: sessionId,
            parent_id: data.parent_id,
            directory: data.directory,
            title: data.title,
            disabled: 0
        };

        const id = await db.insert('oc_sessions', ocSession);
        const createdSession: OCSession = {
            id,
            ...ocSession,
            created: new Date(),
            updated: new Date()
        };

        return createdSession;
    }

    static async findBySessionId(sessionId: string): Promise<OCSession | undefined> {
        const row = await db.selectOne('oc_sessions', 'session_id = ? AND disabled = 0', [sessionId]);
        return row ? OCSessionModel.mapRowToOCSession(row) : undefined;
    }

    static async findLatestByUserId(userId: number): Promise<OCSession | undefined> {
        const rows = await db.selectAllFrom('oc_sessions', 'user_id = ? AND disabled = 0', 'updated DESC', [userId]);
        return rows.length > 0 ? OCSessionModel.mapRowToOCSession(rows[0]) : undefined;
    }

    static async findByUserId(userId: number): Promise<OCSession[]> {
        const rows = await db.selectAllFrom('oc_sessions', 'user_id = ?', 'updated DESC', [userId]);
        return rows.map(OCSessionModel.mapRowToOCSession);
    }

    static async update(id: number, data: Partial<Omit<OCSession, 'id' | 'created'>>): Promise<OCSession | undefined> {
        const updateData: Partial<OCSession> = {
            ...data,
            updated: new Date()
        };

        const affectedRows = await db.update('oc_sessions', updateData, 'id = ?', [id]);
        if (affectedRows === 0) {
            return undefined;
        }

        return await OCSessionModel.findById(id);
    }

    static async findById(id: number): Promise<OCSession | undefined> {
        const row = await db.selectOne('oc_sessions', 'id = ?', [id]);
        return row ? OCSessionModel.mapRowToOCSession(row) : undefined;
    }

    static async delete(id: number): Promise<boolean> {
        const deletedRows = await db.delete('oc_sessions', 'id = ?', [id]);
        return deletedRows > 0;
    }

    static async disableByUserId(userId: number): Promise<number> {
        return await db.update('oc_sessions', { disabled: 1, updated: new Date() }, 'user_id = ? AND disabled = 0', [userId]);
    }

    private static mapRowToOCSession(row: any): OCSession {
        return {
            id: row.id,
            user_id: row.user_id,
            session_id: row.session_id,
            parent_id: row.parent_id,
            directory: row.directory,
            title: row.title,
            disabled: row.disabled,
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}