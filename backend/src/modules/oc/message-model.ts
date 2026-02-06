import { OCMessage } from '../../types/oc_message';
import { db } from '../../config/database';

export class OCMessageModel {
    static async create(data: Omit<OCMessage, 'id' | 'created'>): Promise<OCMessage> {
        const messageData = {
            user_id: data.user_id,
            session_id: data.session_id,
            message: data.message
        };

        const id = await db.insert('oc_messages', messageData);
        const createdMessage: OCMessage = {
            id,
            ...messageData,
            created: new Date()
        };

        return createdMessage;
    }

    static async findById(id: number): Promise<OCMessage | undefined> {
        const row = await db.selectOne('oc_messages', 'id = ?', [id]);
        return row ? OCMessageModel.mapRowToOCMessage(row) : undefined;
    }

    static async findBySessionId(sessionId: string): Promise<OCMessage[]> {
        const rows = await db.selectAllFrom('oc_messages', 'session_id = ?', 'created DESC', [sessionId]);
        return rows.map(OCMessageModel.mapRowToOCMessage);
    }

    static async findByUserId(userId: number): Promise<OCMessage[]> {
        const rows = await db.selectAllFrom('oc_messages', 'user_id = ?', 'created DESC', [userId]);
        return rows.map(OCMessageModel.mapRowToOCMessage);
    }

    static async findBySessionIdAndUserId(sessionId: string, userId: number): Promise<OCMessage[]> {
        const rows = await db.selectAllFrom('oc_messages', 'session_id = ? AND user_id = ?', 'created DESC', [sessionId, userId]);
        return rows.map(OCMessageModel.mapRowToOCMessage);
    }

    static async delete(id: number): Promise<boolean> {
        const deletedRows = await db.delete('oc_messages', 'id = ?', [id]);
        return deletedRows > 0;
    }

    static async deleteBySessionId(sessionId: string): Promise<number> {
        return await db.delete('oc_messages', 'session_id = ?', [sessionId]);
    }

    private static mapRowToOCMessage(row: any): OCMessage {
        return {
            id: row.id,
            user_id: row.user_id,
            session_id: row.session_id,
            message: row.message,
            created: new Date(row.created)
        };
    }
}
