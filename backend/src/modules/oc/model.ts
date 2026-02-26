import { db } from '../../config/database.js';

// OC Session type definition
export type OCSession = {
    id: number
    user_id: number
    session_id: string
    parent_id?: string
    directory?: string
    title?: string
    type: number
    skill_id: number
    disabled: number
    created: Date
}

// OC Skill Callback type definition
export type OCSkillCallbackModelType = {
    id: number
    skill_id: number
    session_id: string
    event: string
    type: string
    data: any
    created: Date
}

// OC Session model for database operations
export class OCSessionModel {
    /**
     * Create a new OC session
     */
    static async create(data: Omit<OCSession, 'id' | 'created'>): Promise<OCSession> {
        const sessionData = {
            user_id: data.user_id,
            session_id: data.session_id,
            parent_id: data.parent_id || null,
            directory: data.directory || null,
            title: data.title || null,
            type: data.type || 0,
            skill_id: data.skill_id || 0,
            disabled: data.disabled || 0
        };

        const id = await db.insert('oc_sessions', sessionData);
        const session: OCSession = {
            id,
            ...sessionData,
            created: new Date()
        };

        return session;
    }

    /**
     * Find session by ID (local database ID)
     */
    static async findById(id: number): Promise<OCSession | undefined> {
        const row = await db.selectOne('oc_sessions', 'id = ?', [id]);
        return row ? OCSessionModel.mapRowToSession(row) : undefined;
    }

    /**
     * Find session by OpenCode session_id
     */
    static async findBySessionId(sessionId: string): Promise<OCSession | undefined> {
        const row = await db.selectOne('oc_sessions', 'session_id = ?', [sessionId]);
        return row ? OCSessionModel.mapRowToSession(row) : undefined;
    }

    /**
     * Find session by local ID (maps to OpenCode session_id via database)
     */
    static async findByLocalId(localId: number): Promise<OCSession | undefined> {
        const row = await db.selectOne('oc_sessions', 'id = ?', [localId]);
        return row ? OCSessionModel.mapRowToSession(row) : undefined;
    }

    /**
     * Find all sessions for a user
     */
    static async findByUserId(userId: number, options?: {
        page?: number;
        size?: number;
        disabled?: number;
    }): Promise<{ sessions: OCSession[]; total: number }> {
        let whereClause = 'user_id = ?';
        let params: any[] = [userId];

        if (options?.disabled !== undefined) {
            whereClause += ' AND disabled = ?';
            params.push(options.disabled);
        }

        const { items, total } = await db.selectWithPagination(
            'oc_sessions',
            whereClause,
            params,
            'created DESC',
            options?.page || 1,
            options?.size || 10
        );

        const sessions = items.map(OCSessionModel.mapRowToSession);
        return { sessions, total };
    }

    /**
     * Update session by local ID
     */
    static async update(id: number, data: Partial<Omit<OCSession, 'id' | 'user_id' | 'session_id' | 'created'>>): Promise<OCSession | undefined> {
        const updateData: Partial<OCSession> = { ...data };

        const affectedRows = await db.update('oc_sessions', updateData, 'id = ?', [id]);
        if (affectedRows === 0) {
            return undefined;
        }

        return await OCSessionModel.findById(id);
    }

    /**
     * Update session by session_id (OpenCode ID)
     */
    static async updateBySessionId(sessionId: string, data: Partial<Omit<OCSession, 'id' | 'user_id' | 'session_id' | 'created'>>): Promise<OCSession | undefined> {
        const updateData: Partial<OCSession> = { ...data };

        const affectedRows = await db.update('oc_sessions', updateData, 'session_id = ?', [sessionId]);
        if (affectedRows === 0) {
            return undefined;
        }

        return await OCSessionModel.findBySessionId(sessionId);
    }

    /**
     * Disable (soft delete) session by ID
     */
    static async disable(id: number): Promise<boolean> {
        const affectedRows = await db.update('oc_sessions', { disabled: 1 }, 'id = ?', [id]);
        return affectedRows > 0;
    }

    /**
     * Delete session by ID (hard delete)
     */
    static async delete(id: number): Promise<boolean> {
        const deletedRows = await db.delete('oc_sessions', 'id = ?', [id]);
        return deletedRows > 0;
    }

    /**
     * Get active sessions count for a user
     */
    static async getActiveCount(userId: number): Promise<number> {
        return await db.count('oc_sessions', 'user_id = ? AND disabled = 0', [userId]);
    }

    /**
     * Map database row to OCSession type
     */
    private static mapRowToSession(row: any): OCSession {
        return {
            id: row.id,
            user_id: row.user_id,
            session_id: row.session_id,
            parent_id: row.parent_id || undefined,
            directory: row.directory || undefined,
            title: row.title || undefined,
            type: row.type,
            skill_id: row.skill_id,
            disabled: row.disabled,
            created: new Date(row.created)
        };
    }
}

// OC Skill Callback model for database operations
export class OCSkillCallbackModel {
    /**
     * Create a new skill callback record
     */
    static async create(data: Omit<OCSkillCallbackModelType, 'id' | 'created'>): Promise<OCSkillCallbackModelType> {
        const callbackData = {
            skill_id: data.skill_id,
            session_id: data.session_id,
            event: data.event,
            type: data.type,
            data: typeof data.data === 'string' ? data.data : JSON.stringify(data.data)
        };

        const id = await db.insert('oc_skill_callbacks', callbackData);
        const callback: OCSkillCallbackModelType = {
            id,
            ...callbackData,
            created: new Date()
        };

        return callback;
    }

    /**
     * Find callback by ID
     */
    static async findById(id: number): Promise<OCSkillCallbackModelType | undefined> {
        const row = await db.selectOne('oc_skill_callbacks', 'id = ?', [id]);
        return row ? OCSkillCallbackModel.mapRowToCallback(row) : undefined;
    }

    /**
     * Find callbacks by session ID
     */
    static async findBySessionId(sessionId: string): Promise<OCSkillCallbackModelType[]> {
        const rows = await db.selectAllFrom('oc_skill_callbacks', 'session_id = ?', 'created DESC', [sessionId]);
        return rows.map(OCSkillCallbackModel.mapRowToCallback);
    }

    /**
     * Find callbacks by skill ID
     */
    static async findBySkillId(skillId: number): Promise<OCSkillCallbackModelType[]> {
        const rows = await db.selectAllFrom('oc_skill_callbacks', 'skill_id = ?', 'created DESC', [skillId]);
        return rows.map(OCSkillCallbackModel.mapRowToCallback);
    }

    /**
     * Find callbacks by session ID and skill ID
     */
    static async findBySessionAndSkill(sessionId: string, skillId: number): Promise<OCSkillCallbackModelType[]> {
        const rows = await db.selectAllFrom('oc_skill_callbacks', 'session_id = ? AND skill_id = ?', 'created DESC', [sessionId, skillId]);
        return rows.map(OCSkillCallbackModel.mapRowToCallback);
    }

    /**
     * Delete callback by ID
     */
    static async delete(id: number): Promise<boolean> {
        const deletedRows = await db.delete('oc_skill_callbacks', 'id = ?', [id]);
        return deletedRows > 0;
    }

    /**
     * Delete callbacks by session ID
     */
    static async deleteBySessionId(sessionId: string): Promise<number> {
        return await db.delete('oc_skill_callbacks', 'session_id = ?', [sessionId]);
    }

    /**
     * Get callback count for a session
     */
    static async getCountBySessionId(sessionId: string): Promise<number> {
        return await db.count('oc_skill_callbacks', 'session_id = ?', [sessionId]);
    }

    /**
     * Map database row to OCSkillCallbackModelType
     */
    private static mapRowToCallback(row: any): OCSkillCallbackModelType {
        let data = row.data;
        try {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
        } catch (e) {
            // keep as string if parse fails
        }

        return {
            id: row.id,
            skill_id: Number(row.skill_id),
            session_id: row.session_id,
            event: row.event,
            type: row.type,
            data: data,
            created: new Date(row.created)
        };
    }
}

export default { OCSessionModel, OCSkillCallbackModel };
