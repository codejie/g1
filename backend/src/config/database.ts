import sqlite3 from 'sqlite3';
import config from './index.js';

const dbPath = config.DATABASE_PATH;

class DatabaseWrapper {
    private db: sqlite3.Database;

    constructor() {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database');
            }
        });
    }

    // Initialize database tables
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                // Create users table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        disabled INTEGER NOT NULL DEFAULT 0,
                        created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating users table:', err.message);
                        return reject(err);
                    }
                });

                // Create user_tokens table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS user_tokens (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        token VARCHAR(255) NOT NULL UNIQUE,
                        expires DATETIME NOT NULL,
                        disabled INTEGER NOT NULL DEFAULT 0,
                        created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(user_id) REFERENCES users(id)
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating user_tokens table:', err.message);
                        return reject(err);
                    }
                });

                // Create user_sessions table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS user_sessions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        session_id INTEGER NOT NULL,
                        title VARCHAR(255),
                        type INTEGER NOT NULL,
                        skill_id INTEGER,
                        disabled INTEGER NOT NULL DEFAULT 0,
                        created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(user_id) REFERENCES users(id)
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating user_sessions table:', err.message);
                        return reject(err);
                    }
                });

                // Create apps table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS apps (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        app_type INTEGER NOT NULL DEFAULT 0,
                        name VARCHAR(100) NOT NULL,
                        description TEXT,
                        disabled INTEGER NOT NULL DEFAULT 0,
                        created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(user_id) REFERENCES users(id)
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating apps table:', err.message);
                        return reject(err);
                    }
                });

                // Create skills table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS skills (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        type INTEGER NOT NULL,
                        name VARCHAR(100) NOT NULL UNIQUE,
                        version VARCHAR(50) NOT NULL,
                        description TEXT,
                        extra_arguments TEXT,
                        disabled INTEGER NOT NULL DEFAULT 0,
                        created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating skills table:', err.message);
                        return reject(err);
                    }
                });

                // Create skills_callback table
                // this.db.run(`
                //     CREATE TABLE IF NOT EXISTS skills_callback (
                //         id INTEGER PRIMARY KEY AUTOINCREMENT,
                //         skill_id INTEGER NOT NULL,
                //         session_id VARCHAR(255) NOT NULL,
                //         event VARCHAR(100) NOT NULL,
                //         type VARCHAR(50) NOT NULL,
                //         data TEXT,
                //         created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                //         FOREIGN KEY(skill_id) REFERENCES skills(id)
                //     )
                // `, (err) => {
                //     if (err) {
                //         console.error('Error creating skills_callback table:', err.message);
                //         return reject(err);
                //     }
                // });

                // Create files table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS files (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        type VARCHAR(50) NOT NULL,
                        path VARCHAR(255) NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        status INTEGER NOT NULL DEFAULT 0,
                        created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(user_id) REFERENCES users(id)
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating files table:', err.message);
                        return reject(err);
                    }
                });

                // Create apps_prd_report table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS apps_prd_report (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        skill_id INTEGER NOT NULL,
                        session_id INTEGER NOT NULL,
                        app_id INTEGER NOT NULL,
                        result INTEGER NOT NULL DEFAULT 0,
                        message TEXT,
                        file_id INTEGER NOT NULL,
                        created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY(skill_id) REFERENCES skills(id),
                        FOREIGN KEY(app_id) REFERENCES apps(id)
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating apps_prd_report table:', err.message);
                        return reject(err);
                    }
                });

                console.log('Database tables initialized successfully');
                resolve();
            });
        });
    }

    // Promisify database methods
    private run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });
    }

    private get(sql: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    private all(sql: string, params: any[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Common database operations
    async insert(table: string, data: any): Promise<number> {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        const result = await this.run(sql, values);
        return (result as sqlite3.RunResult).lastID || 0;
    }

    async selectOne(table: string, where: string, params: any[] = []): Promise<any> {
        const sql = `SELECT * FROM ${table} WHERE ${where}`;
        return await this.get(sql, params);
    }

    async selectAll(sql: string, params: any[] = []): Promise<any[]> {
        return await this.all(sql, params);
    }

    async selectAllFrom(table: string, where: string = '1=1', orderBy: string = '', params: any[] = []): Promise<any[]> {
        let sql = `SELECT * FROM ${table} WHERE ${where}`;
        if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
        }
        return await this.all(sql, params);
    }

    async queryOne(sql: string, params: any[] = []): Promise<any> {
        return await this.get(sql, params);
    }

    async queryAll(sql: string, params: any[] = []): Promise<any[]> {
        return await this.all(sql, params);
    }

    async update(table: string, data: any, where: string, params: any[] = []): Promise<number> {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), ...params];
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
        const result = await this.run(sql, values);
        return (result as sqlite3.RunResult).changes || 0;
    }

    async delete(table: string, where: string, params: any[] = []): Promise<number> {
        const sql = `DELETE FROM ${table} WHERE ${where}`;
        const result = await this.run(sql, params);
        return (result as sqlite3.RunResult).changes || 0;
    }

    async count(table: string, where: string = '1=1', params: any[] = []): Promise<number> {
        const sql = `SELECT COUNT(*) as count FROM ${table} WHERE ${where}`;
        const result = await this.get(sql, params);
        return result ? result.count : 0;
    }

    // Pagination support
    async selectWithPagination(
        table: string,
        where: string = '1=1',
        params: any[] = [],
        orderBy: string = '',
        page: number = 1,
        size: number = 10
    ): Promise<{ items: any[], total: number }> {
        // Get total count
        const total = await this.count(table, where, params);

        // Get paginated results
        const offset = (page - 1) * size;
        let sql = `SELECT * FROM ${table} WHERE ${where}`;
        if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
        }
        sql += ` LIMIT ? OFFSET ?`;

        const items = await this.all(sql, [...params, size, offset]);

        return { items, total };
    }

    // Close database connection
    close(): void {
        this.db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed');
            }
        });
    }
}

// Create and export database instance
export const db = new DatabaseWrapper();

export default db;
