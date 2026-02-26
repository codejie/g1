import { User, UserStudio, UserToken } from '../../types/user.js';
import { db } from '../../config/database.js';

export class UserModel {
    static async create(userData: Omit<User, 'id' | 'created' | 'updated'>): Promise<User> {
        const user: Omit<User, 'id' | 'created' | 'updated'> = {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            disabled: userData.disabled || 0
        };

        const id = await db.insert('users', user);
        const createdUser: User = {
            id,
            ...user,
            created: new Date(),
            updated: new Date()
        };

        return createdUser;
    }

    static async findById(id: number): Promise<User | undefined> {
        const row = await db.selectOne('users', 'id = ?', [id]);
        return row ? UserModel.mapRowToUser(row) : undefined;
    }

    static async findByUsername(username: string): Promise<User | undefined> {
        const row = await db.selectOne('users', 'username = ?', [username]);
        return row ? UserModel.mapRowToUser(row) : undefined;
    }

    static async findByEmail(email: string): Promise<User | undefined> {
        const row = await db.selectOne('users', 'email = ?', [email]);
        return row ? UserModel.mapRowToUser(row) : undefined;
    }

    static async findAll(options?: {
        page?: number;
        size?: number;
        filter?: Record<string, any>;
        sort?: Array<{ field: string; order: 'ASC' | 'DESC' }>;
    }): Promise<{ users: User[]; total: number }> {
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
            'users',
            whereClause,
            params,
            orderBy,
            options?.page || 1,
            options?.size || 10
        );

        const users = items.map(UserModel.mapRowToUser);
        return { users, total };
    }

    static async update(id: number, data: Partial<Omit<User, 'id' | 'created'>>): Promise<User | undefined> {
        const updateData: Partial<User> = {
            ...data,
            updated: new Date()
        };

        const affectedRows = await db.update('users', updateData, 'id = ?', [id]);
        if (affectedRows === 0) {
            return undefined;
        }

        return await UserModel.findById(id);
    }

    static async delete(id: number): Promise<boolean> {
        const deletedRows = await db.delete('users', 'id = ?', [id]);
        return deletedRows > 0;
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

export class UserStudioModel {
    static async create(data: Omit<UserStudio, 'id' | 'created' | 'updated'>): Promise<UserStudio> {
        const id = await db.insert('user_studios', data);
        const userStudio: UserStudio = {
            id,
            ...data,
            created: new Date(),
            updated: new Date()
        };

        return userStudio;
    }

    static async findByUserId(userId: number): Promise<UserStudio[]> {
        const rows = await db.selectAll('SELECT * FROM user_studios WHERE user_id = ?', [userId]);
        return rows.map(UserStudioModel.mapRowToUserStudio);
    }

    static async findByStudioId(studioId: number): Promise<UserStudio[]> {
        const rows = await db.selectAll('SELECT * FROM user_studios WHERE studio_id = ?', [studioId]);
        return rows.map(UserStudioModel.mapRowToUserStudio);
    }

    static async findDefaultStudio(userId: number): Promise<UserStudio | undefined> {
        const row = await db.selectOne('user_studios', 'user_id = ? AND is_default = 1', [userId]);
        return row ? UserStudioModel.mapRowToUserStudio(row) : undefined;
    }

    static async findUserStudio(userId: number, studioId: number): Promise<UserStudio | undefined> {
        const row = await db.selectOne('user_studios', 'user_id = ? AND studio_id = ?', [userId, studioId]);
        return row ? UserStudioModel.mapRowToUserStudio(row) : undefined;
    }

    static async findAllByUserId(userId: number, options?: {
        page?: number;
        size?: number;
    }): Promise<{ items: any[]; total: number }> {
        const { items, total } = await db.selectWithPagination(
            'user_studios us JOIN studios s ON us.studio_id = s.id',
            'us.user_id = ?',
            [userId],
            'us.updated DESC',
            options?.page || 1,
            options?.size || 10
        );

        return {
            items: items.map(item => ({
                ...UserStudioModel.mapRowToUserStudio(item),
                studio_name: item.name
            })),
            total
        };
    }

    static async update(id: number, data: Partial<Omit<UserStudio, 'id' | 'created'>>): Promise<boolean> {
        const updateData = {
            ...data,
            updated: new Date()
        };

        const affectedRows = await db.update('user_studios', updateData, 'id = ?', [id]);
        return affectedRows > 0;
    }

    static async delete(id: number): Promise<boolean> {
        const deletedRows = await db.delete('user_studios', 'id = ?', [id]);
        return deletedRows > 0;
    }

    static async deleteByUserIdStudioId(userId: number, studioId: number): Promise<boolean> {
        const deletedRows = await db.delete('user_studios', 'user_id = ? AND studio_id = ?', [userId, studioId]);
        return deletedRows > 0;
    }

    static async clearDefaultStudios(userId: number): Promise<void> {
        await db.update('user_studios', { is_default: 0, updated: new Date() }, 'user_id = ?', [userId]);
    }

    private static mapRowToUserStudio(row: any): UserStudio {
        return {
            id: row.id,
            user_id: row.user_id,
            studio_id: row.studio_id,
            role: row.role,
            is_default: Boolean(row.is_default),
            is_owner: Boolean(row.is_owner),
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}

export class UserTokenModel {
    static async create(data: Omit<UserToken, 'id' | 'created' | 'updated'>): Promise<UserToken> {
        const id = await db.insert('user_tokens', data);
        const userToken: UserToken = {
            id,
            ...data,
            created: new Date(),
            updated: new Date()
        };

        return userToken;
    }

    static async findByToken(token: string): Promise<UserToken | undefined> {
        const row = await db.selectOne('user_tokens', 'token = ? AND disabled = 0', [token]);
        return row ? UserTokenModel.mapRowToUserToken(row) : undefined;
    }

    static async findByUserId(userId: number, options?: {
        page?: number;
        size?: number;
    }): Promise<{ tokens: UserToken[]; total: number }> {
        const { items, total } = await db.selectWithPagination(
            'user_tokens',
            'user_id = ?',
            [userId],
            'created DESC',
            options?.page || 1,
            options?.size || 10
        );

        const tokens = items.map(UserTokenModel.mapRowToUserToken);
        return { tokens, total };
    }

    static async revokeByToken(token: string): Promise<boolean> {
        const affectedRows = await db.update('user_tokens', { disabled: 1, updated: new Date() }, 'token = ?', [token]);
        return affectedRows > 0;
    }

    static async revokeByUserId(userId: number): Promise<number> {
        return await db.update('user_tokens', { disabled: 1, updated: new Date() }, 'user_id = ?', [userId]);
    }

    static async deleteExpired(): Promise<number> {
        const now = new Date().toISOString();
        return await db.update('user_tokens', { disabled: 1, updated: new Date() }, 'expires < ? AND disabled = 0', [now]);
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