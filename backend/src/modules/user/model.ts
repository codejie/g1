import { FastifyInstance } from 'fastify';
import { User } from '../../types/user';
import { db } from '../../config/database';

export class UserModel {
    static async create(userData: User & { id?: string }): Promise<User> {
        const user: User = {
            id: userData.id || crypto.randomUUID(),
            email: userData.email,
            password: userData.password,
            name: userData.name,
            status: userData.status,
            created: userData.created || new Date(),
            updated: userData.updated || new Date()
        };

        // Use db instance
        await db.insert('users', user);
        return user;
    }

    static async findById(id: string): Promise<User | undefined> {
        const row = await db.selectOne('users', 'id = ?', [id]);
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
            'users',
            whereClause,
            params,
            orderBy,
            options?.page || 1,
            options?.size || 10
        );

        const users = items.map(row => UserModel.mapRowToUser(row));
        return { users, total };
    }

    static async update(id: string, updates: Partial<Omit<User, 'id' | 'created'>>): Promise<User | undefined> {
        const updateData: Partial<User> = {
            ...updates,
            updated: new Date()
        };

        await db.update('users', updateData, 'id = ?', [id]);
        return UserModel.findById(id);
    }

    static async delete(id: string): Promise<boolean> {
        const changes = await db.delete('users', 'id = ?', [id]);
        return changes > 0;
    }

    private static mapRowToUser(row: any): User {
        return {
            id: row.id,
            email: row.email,
            password: row.password,
            name: row.name,
            status: row.status,
            created: new Date(row.created),
            updated: new Date(row.updated)
        };
    }
}