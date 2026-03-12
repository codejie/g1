import { SkillsCallbackEvent, SkillsCallbackType } from '../../types/oc.js';

// User Session model type definition
export type SessionType = 0 | 1 | 2; // 0/general, 1/coding, 2/debugging
export type UserSessionModelType = {
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

// OC Skill Callback model type definition
export type SkillsCallbackModelType = {
    id: number
    skill_id: number
    session_id: string
    event: SkillsCallbackEvent
    type: SkillsCallbackType
    data: any
    created: Date
}

// Skills Callback model for database operations
export class SkillsCallbackModel {
    /**
     * Create a new skill callback record
     */
    static async create(data: Omit<SkillsCallbackModelType, 'id' | 'created'>): Promise<SkillsCallbackModelType> {
        const { db } = await import('../../config/database.js');
        try {
            const insertData = {
                skill_id: data.skill_id,
                session_id: data.session_id,
                event: data.event,
                type: data.type,
                data: data.data !== undefined ? JSON.stringify(data.data) : null
            } as any;
            const id = await db.insert('skills_callback', insertData);
            const created = await SkillsCallbackModel.findById(id);
            if (!created) {
                throw new Error('Failed to create skills callback');
            }
            return created;
        } catch (error: any) {
            throw new Error(`Failed to create skills callback: ${error.message}`);
        }
    }

    /**
     * Find callback by ID
     */
    static async findById(id: number): Promise<SkillsCallbackModelType | undefined> {
        const { db } = await import('../../config/database.js');
        try {
            const row = await db.queryOne('SELECT * FROM skills_callback WHERE id = ?', [id]);
            return row ? SkillsCallbackModel.mapRowToCallback(row) : undefined;
        } catch (error: any) {
            throw new Error(`Failed to find skills callback by id: ${error.message}`);
        }
    }

    /**
     * Find callbacks by session ID
     */
    static async findBySessionId(sessionId: string): Promise<SkillsCallbackModelType[]> {
        const { db } = await import('../../config/database.js');
        try {
            const rows = await db.queryAll(
                'SELECT * FROM skills_callback WHERE session_id = ? ORDER BY created DESC',
                [sessionId]
            );
            return rows.map(SkillsCallbackModel.mapRowToCallback);
        } catch (error: any) {
            throw new Error(`Failed to find skills callbacks by session: ${error.message}`);
        }
    }

    /**
     * Find callbacks by skill ID
     */
    static async findBySkillId(skillId: number): Promise<SkillsCallbackModelType[]> {
        const { db } = await import('../../config/database.js');
        try {
            const rows = await db.queryAll(
                'SELECT * FROM skills_callback WHERE skill_id = ? ORDER BY created DESC',
                [skillId]
            );
            return rows.map(SkillsCallbackModel.mapRowToCallback);
        } catch (error: any) {
            throw new Error(`Failed to find skills callbacks by skill: ${error.message}`);
        }
    }

    /**
     * Find callbacks by session ID and skill ID
     */
    static async findBySessionAndSkill(sessionId: string, skillId: number): Promise<SkillsCallbackModelType[]> {
        const { db } = await import('../../config/database.js');
        try {
            const rows = await db.queryAll(
                'SELECT * FROM skills_callback WHERE session_id = ? AND skill_id = ? ORDER BY created DESC',
                [sessionId, skillId]
            );
            return rows.map(SkillsCallbackModel.mapRowToCallback);
        } catch (error: any) {
            throw new Error(`Failed to find skills callbacks by session and skill: ${error.message}`);
        }
    }

    /**
     * Delete callback by ID
     */
    static async delete(id: number): Promise<boolean> {
        const { db } = await import('../../config/database.js');
        try {
            const result = await db.delete('skills_callback', 'id = ?', [id]);
            return result > 0;
        } catch (error: any) {
            throw new Error(`Failed to delete skills callback: ${error.message}`);
        }
    }

    /**
     * Delete callbacks by session ID
     */
    static async deleteBySessionId(sessionId: string): Promise<number> {
        const { db } = await import('../../config/database.js');
        try {
            return await db.delete('skills_callback', 'session_id = ?', [sessionId]);
        } catch (error: any) {
            throw new Error(`Failed to delete skills callbacks by session: ${error.message}`);
        }
    }

    /**
     * Get callback count for a session
     */
    static async getCountBySessionId(sessionId: string): Promise<number> {
        const { db } = await import('../../config/database.js');
        try {
            return await db.count('skills_callback', 'session_id = ?', [sessionId]);
        } catch (error: any) {
            throw new Error(`Failed to count skills callbacks by session: ${error.message}`);
        }
    }

    /**
     * Map database row to SkillsCallbackModelType
     */
    private static mapRowToCallback(row: any): SkillsCallbackModelType {
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
    static async create(data: Omit<UserSessionModelType, 'id' | 'created' | 'updated'>): Promise<UserSessionModelType> {
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
    static async findById(id: number): Promise<UserSessionModelType | undefined> {
        const { db } = await import('../../config/database.js');
        const row = await db.queryOne('SELECT * FROM user_sessions WHERE id = ?', [id]);
        return row ? UserSessionModel.mapRowToUserSession(row) : undefined;
    }

    /**
     * Find sessions by user ID
     */
    static async findByUserId(userId: number): Promise<UserSessionModelType[]> {
        const { db } = await import('../../config/database.js');
        const rows = await db.queryAll('SELECT * FROM user_sessions WHERE user_id = ? ORDER BY created DESC', [userId]);
        return rows.map(UserSessionModel.mapRowToUserSession);
    }

    /**
     * Find session by OpenCode session_id
     */
    static async findBySessionId(sessionId: string): Promise<UserSessionModelType | undefined> {
        const { db } = await import('../../config/database.js');
        const row = await db.queryOne('SELECT * FROM user_sessions WHERE session_id = ?', [sessionId]);
        return row ? UserSessionModel.mapRowToUserSession(row) : undefined;
    }

    /**
     * Update session
     */
    static async update(id: number, data: Partial<Omit<UserSessionModelType, 'id' | 'created' | 'updated'>>): Promise<UserSessionModelType | undefined> {
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
     * Map database row to UserSessionModelType
     */
    private static mapRowToUserSession(row: any): UserSessionModelType {
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

export default { SkillsCallbackModel, UserSessionModel };
