// User Session type definition
export type SessionType = 0 | 1 | 2; // 0/general, 1/coding, 2/debugging
export type UserSession = {
    id?: number; // local session
    user_id: number;
    session_id: string; // OpenCode session id
    title?: string;
    type: SessionType;
    skill_id?: number;
    disabled: number; // 0/1, default 0
    created: Date;
    updated: Date;
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

// OC Skill Callback model for database operations
export class OCSkillCallbackModel {
    /**
     * Create a new skill callback record
     */
    static async create(data: Omit<OCSkillCallbackModelType, 'id' | 'created'>): Promise<OCSkillCallbackModelType> {
        throw new Error('Database operation disabled: OCSkillCallbackModel.create');
    }

    /**
     * Find callback by ID
     */
    static async findById(id: number): Promise<OCSkillCallbackModelType | undefined> {
        throw new Error('Database operation disabled: OCSkillCallbackModel.findById');
    }

    /**
     * Find callbacks by session ID
     */
    static async findBySessionId(sessionId: string): Promise<OCSkillCallbackModelType[]> {
        throw new Error('Database operation disabled: OCSkillCallbackModel.findBySessionId');
    }

    /**
     * Find callbacks by skill ID
     */
    static async findBySkillId(skillId: number): Promise<OCSkillCallbackModelType[]> {
        throw new Error('Database operation disabled: OCSkillCallbackModel.findBySkillId');
    }

    /**
     * Find callbacks by session ID and skill ID
     */
    static async findBySessionAndSkill(sessionId: string, skillId: number): Promise<OCSkillCallbackModelType[]> {
        throw new Error('Database operation disabled: OCSkillCallbackModel.findBySessionAndSkill');
    }

    /**
     * Delete callback by ID
     */
    static async delete(id: number): Promise<boolean> {
        throw new Error('Database operation disabled: OCSkillCallbackModel.delete');
    }

    /**
     * Delete callbacks by session ID
     */
    static async deleteBySessionId(sessionId: string): Promise<number> {
        throw new Error('Database operation disabled: OCSkillCallbackModel.deleteBySessionId');
    }

    /**
     * Get callback count for a session
     */
    static async getCountBySessionId(sessionId: string): Promise<number> {
        throw new Error('Database operation disabled: OCSkillCallbackModel.getCountBySessionId');
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

// User Session model for database operations
export class UserSessionModel {
    /**
     * Create a new user session
     */
    static async create(data: Omit<UserSession, 'id' | 'created' | 'updated'>): Promise<UserSession> {
        const { db } = await import('../../config/database.js');
        const insertData = {
            user_id: data.user_id,
            session_id: data.session_id,
            title: data.title || null,
            type: data.type,
            skill_id: data.skill_id || null,
            disabled: data.disabled
        };
        const id = await db.insert('user_sessions', insertData);
        const created = await UserSessionModel.findById(id);
        if (!created) {
            throw new Error('Failed to create user session');
        }
        return created;
    }

    /**
     * Find session by ID
     */
    static async findById(id: number): Promise<UserSession | undefined> {
        const { db } = await import('../../config/database.js');
        const row = await db.queryOne('SELECT * FROM user_sessions WHERE id = ?', [id]);
        return row ? UserSessionModel.mapRowToUserSession(row) : undefined;
    }

    /**
     * Find sessions by user ID
     */
    static async findByUserId(userId: number): Promise<UserSession[]> {
        const { db } = await import('../../config/database.js');
        const rows = await db.queryAll('SELECT * FROM user_sessions WHERE user_id = ? ORDER BY created DESC', [userId]);
        return rows.map(UserSessionModel.mapRowToUserSession);
    }

    /**
     * Find session by OpenCode session_id
     */
    static async findBySessionId(sessionId: string): Promise<UserSession | undefined> {
        const { db } = await import('../../config/database.js');
        const row = await db.queryOne('SELECT * FROM user_sessions WHERE session_id = ?', [sessionId]);
        return row ? UserSessionModel.mapRowToUserSession(row) : undefined;
    }

    /**
     * Update session
     */
    static async update(id: number, data: Partial<Omit<UserSession, 'id' | 'created' | 'updated'>>): Promise<UserSession | undefined> {
        const { db } = await import('../../config/database.js');
        const updateData: any = {};

        if (data.user_id !== undefined) updateData.user_id = data.user_id;
        if (data.session_id !== undefined) updateData.session_id = data.session_id;
        if (data.title !== undefined) updateData.title = data.title;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.skill_id !== undefined) updateData.skill_id = data.skill_id;
        if (data.disabled !== undefined) updateData.disabled = data.disabled;
        updateData.updated = new Date().toISOString();

        if (Object.keys(updateData).length === 0) {
            return UserSessionModel.findById(id);
        }

        await db.update('user_sessions', updateData, 'id = ?', [id]);
        return UserSessionModel.findById(id);
    }

    /**
     * Delete session
     */
    static async delete(id: number): Promise<boolean> {
        const { db } = await import('../../config/database.js');
        const result = await db.delete('user_sessions', 'id = ?', [id]);
        return result > 0;
    }

    /**
     * Disable session (soft delete)
     */
    static async disable(id: number): Promise<boolean> {
        const { db } = await import('../../config/database.js');
        const result = await db.update('user_sessions', { disabled: 1, updated: new Date().toISOString() }, 'id = ?', [id]);
        return result > 0;
    }

    /**
     * Get active sessions count for a user
     */
    static async getActiveCount(userId: number): Promise<number> {
        const { db } = await import('../../config/database.js');
        return await db.count('user_sessions', 'user_id = ? AND disabled = 0', [userId]);
    }

    /**
     * Map database row to UserSession type
     */
    private static mapRowToUserSession(row: any): UserSession {
        return {
            id: row.id,
            user_id: row.user_id,
            session_id: row.session_id,
            title: row.title || undefined,
            type: row.type,
            skill_id: row.skill_id || undefined,
            disabled: row.disabled,
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}

export default { OCSkillCallbackModel, UserSessionModel };
