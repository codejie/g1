import fs from 'fs/promises';
import path from 'path';
import config from '../../config/index.js';
import { FileItem } from '../../types/files.js';
import { PageInfo } from '../../types/common.js';

export class FileService {
    private static getUserRoot(userId: number): string {
        return path.join(config.FILES_ROOT, userId.toString());
    }

    public static getSafePath(userId: number, requestPath: string): string {
        const userRoot = this.getUserRoot(userId);
        // Normalize request path to remove .. and ./
        const safeRequestPath = path.normalize(requestPath).replace(/^(\.\.(\/|\\|$))+/, '');
        const fullPath = path.join(userRoot, safeRequestPath);

        // Ensure path is within user root
        if (!fullPath.startsWith(userRoot)) {
            throw new Error('Access denied: Path outside user directory');
        }
        return fullPath;
    }

    static async ensureUserDir(userId: number): Promise<void> {
        const userRoot = this.getUserRoot(userId);
        try {
            await fs.access(userRoot);
        } catch {
            await fs.mkdir(userRoot, { recursive: true });
        }
    }

    static async listFiles(
        userId: number,
        requestPath: string,
        filter?: { name?: string; type?: string; size?: number; created?: string },
        pageInfo?: PageInfo
    ): Promise<{ items: FileItem[]; total: number }> {
        await this.ensureUserDir(userId);
        const fullPath = this.getSafePath(userId, requestPath);

        let dirents;
        try {
            dirents = await fs.readdir(fullPath, { withFileTypes: true });
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                return { items: [], total: 0 };
            }
            throw error;
        }

        let items: FileItem[] = [];
        for (const dirent of dirents) {
            if (dirent.name.startsWith('.')) continue; // skip hidden files

            const itemPath = path.join(fullPath, dirent.name);
            const stats = await fs.stat(itemPath);

            items.push({
                path: path.relative(this.getUserRoot(userId), itemPath),
                name: dirent.name,
                type: dirent.isDirectory() ? 'directory' : path.extname(dirent.name).slice(1) || 'file',
                size: stats.size,
                created: stats.birthtime.toISOString(),
                updated: stats.mtime.toISOString()
            });
        }

        // Filtering
        if (filter) {
            if (filter.name) {
                items = items.filter(item => item.name.toLowerCase().includes(filter.name!.toLowerCase()));
            }
            if (filter.type) {
                items = items.filter(item => item.type === filter.type);
            }
            // Add more filters as needed
        }

        // Sort (default by name)
        items.sort((a, b) => {
            if (a.type === 'directory' && b.type !== 'directory') return -1;
            if (a.type !== 'directory' && b.type === 'directory') return 1;
            return a.name.localeCompare(b.name);
        });

        const total = items.length;

        // Pagination
        if (pageInfo) {
            const page = pageInfo.page || 1;
            const size = pageInfo.size || 20;
            const start = (page - 1) * size;
            items = items.slice(start, start + size);
        }

        return { items, total };
    }
}
