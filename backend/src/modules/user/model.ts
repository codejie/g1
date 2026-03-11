import { User, UserToken } from '../../types/user.js';
import db from '../../config/database.js';

export class UserModel {
    static async create(userData: Omit<User, 'id' | 'created' | 'updated'>): Promise<User> {
        try {
            const id = await db.insert('users', userData);
            return {
                id,
                ...userData,
                created: new Date(),
                updated: new Date()
            };
        } catch (error: any) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    static async findById(id: number): Promise<User | undefined> {
        try {
            const row = await db.selectOne('users', 'id = ?', [id]);
            return row ? this.mapRowToUser(row) : undefined;
        } catch (error: any) {
            throw new Error(`Failed to find user by id: ${error.message}`);
        }
    }

    static async findByUsername(username: string): Promise<User | undefined> {
        try {
            const row = await db.selectOne('users', 'username = ?', [username]);
            return row ? this.mapRowToUser(row) : undefined;
        } catch (error: any) {
            throw new Error(`Failed to find user by username: ${error.message}`);
        }
    }

    static async findByEmail(email: string): Promise<User | undefined> {
        try {
            const row = await db.selectOne('users', 'email = ?', [email]);
            return row ? this.mapRowToUser(row) : undefined;
        } catch (error: any) {
            throw new Error(`Failed to find user by email: ${error.message}`);
        }
    }

    static async findAll(options?: {
        page?: number;
        size?: number;
        filter?: Record<string, any>;
        sort?: Array<{ field: string; order: 'ASC' | 'DESC' }>;
    }): Promise<{ users: User[]; total: number }> {
        try {
            const page = options?.page || 1;
            const size = options?.size || 10;
            let orderBy = '';

            if (options?.sort && options.sort.length > 0) {
                orderBy = options.sort.map(s => `${s.field} ${s.order}`).join(', ');
            }

            const result = await db.selectWithPagination('users', '1=1', [], orderBy, page, size);
            return {
                users: result.items.map(row => this.mapRowToUser(row)),
                total: result.total
            };
        } catch (error: any) {
            throw new Error(`Failed to find all users: ${error.message}`);
        }
    }

    static async update(id: number, data: Partial<Omit<User, 'id' | 'created'>>): Promise<User | undefined> {
        try {
            const updateData = {
                ...data,
                updated: new Date().toISOString()
            };
            await db.update('users', updateData, 'id = ?', [id]);
            return await this.findById(id);
        } catch (error: any) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    static async delete(id: number): Promise<boolean> {
        try {
            const changes = await db.delete('users', 'id = ?', [id]);
            return changes > 0;
        } catch (error: any) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    private static mapRowToUser(row: any): User {
        return {
            id: row.id,
            username: row.username,
            email: row.email,
            password: row.password,
            disabled: row.disabled,
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}

export class UserTokenModel {
    static async create(data: Omit<UserToken, 'id' | 'created' | 'updated'>): Promise<UserToken> {
        try {
            const id = await db.insert('user_tokens', data);
            return {
                id,
                ...data,
                created: new Date(),
                updated: new Date()
            };
        } catch (error: any) {
            throw new Error(`Failed to create token: ${error.message}`);
        }
    }

    static async findByToken(token: string): Promise<UserToken | undefined> {
        try {
            const row = await db.selectOne('user_tokens', 'token = ? AND disabled = 0', [token]);
            return row ? this.mapRowToUserToken(row) : undefined;
        } catch (error: any) {
            throw new Error(`Failed to find token: ${error.message}`);
        }
    }

    static async findByUserId(userId: number, options?: {
        page?: number;
        size?: number;
    }): Promise<{ tokens: UserToken[]; total: number }> {
        try {
            const page = options?.page || 1;
            const size = options?.size || 10;

            const result = await db.selectWithPagination('user_tokens', 'user_id = ?', [userId], 'created DESC', page, size);
            return {
                tokens: result.items.map(row => this.mapRowToUserToken(row)),
                total: result.total
            };
        } catch (error: any) {
            throw new Error(`Failed to find tokens by user id: ${error.message}`);
        }
    }

    static async revokeByToken(token: string): Promise<boolean> {
        try {
            const changes = await db.update('user_tokens', { disabled: 1 }, 'token = ?', [token]);
            return changes > 0;
        } catch (error: any) {
            throw new Error(`Failed to revoke token: ${error.message}`);
        }
    }

    static async revokeByUserId(userId: number): Promise<number> {
        try {
            const changes = await db.update('user_tokens', { disabled: 1 }, 'user_id = ?', [userId]);
            return changes;
        } catch (error: any) {
            throw new Error(`Failed to revoke tokens by user id: ${error.message}`);
        }
    }

    static async deleteExpired(): Promise<number> {
        try {
            const now = new Date().toISOString();
            const changes = await db.delete('user_tokens', 'expires < ?', [now]);
            return changes;
        } catch (error: any) {
            throw new Error(`Failed to delete expired tokens: ${error.message}`);
        }
    }

    private static mapRowToUserToken(row: any): UserToken {
        return {
            id: row.id,
            user_id: row.user_id,
            token: row.token,
            expires: new Date(row.expires),
            disabled: row.disabled,
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}
