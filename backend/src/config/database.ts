import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', '..', 'data', 'app.db');

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
                        id TEXT PRIMARY KEY,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        name TEXT NOT NULL,
                        status INTEGER NOT NULL DEFAULT 0,
                        created DATETIME NOT NULL,
                        updated DATETIME NOT NULL
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating users table:', err.message);
                        return reject(err);
                    }
                });

                // Create sessions table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS sessions (
                        id TEXT PRIMARY KEY,
                        parentId TEXT,
                        directory TEXT NOT NULL,
                        title TEXT,
                        created DATETIME NOT NULL,
                        updated DATETIME NOT NULL,
                        FOREIGN KEY (parentId) REFERENCES sessions(id)
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating sessions table:', err.message);
                        return reject(err);
                    }
                });

                // Create files table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS files (
                        id TEXT PRIMARY KEY,
                        fileName TEXT NOT NULL,
                        filePath TEXT NOT NULL,
                        size INTEGER NOT NULL,
                        mimetype TEXT NOT NULL,
                        created DATETIME NOT NULL,
                        updated DATETIME NOT NULL
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating files table:', err.message);
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
            this.db.run(sql, params, function(err) {
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
            this.db.get(sql, params, function(err, row) {
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
            this.db.all(sql, params, function(err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Common database operations
    async insert(table: string, data: any): Promise<void> {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        await this.run(sql, values);
    }

    async selectOne(table: string, where: string, params: any[] = []): Promise<any> {
        const sql = `SELECT * FROM ${table} WHERE ${where} LIMIT 1`;
        return await this.get(sql, params);
    }

    async selectAll(table: string, where: string = '1=1', params: any[] = [], orderBy: string = ''): Promise<any[]> {
        let sql = `SELECT * FROM ${table} WHERE ${where}`;
        if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
        }
        return await this.all(sql, params);
    }

    async update(table: string, data: any, where: string, params: any[] = []): Promise<void> {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), ...params];
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
        await this.run(sql, values);
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