import { FastifyRequest, FastifyReply } from 'fastify';
import { FileListRequest, FileDownloadRequest } from '../../types/files';
import { FileService } from './service';
import { sendSuccess, sendError } from '../../utils/response';
import { RESPONSE_CODES } from '../../types/common';
import fs from 'fs';
import util from 'util';
import path from 'path';
import { pipeline } from 'stream';

const pump = util.promisify(pipeline);

export const listFiles = async (request: FastifyRequest<{ Body: FileListRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }
    const userId = (request.user as any).id;
    const { path: requestPath, filter, page_info } = request.body;

    try {
        const result = await FileService.listFiles(userId, requestPath, filter, page_info);
        return sendSuccess(reply, result);
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error.message);
    }
};

export const downloadFile = async (request: FastifyRequest<{ Body: FileDownloadRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }
    const userId = (request.user as any).id;
    const { path: filePath, name } = request.body;

    try {
        const fullPath = FileService.getSafePath(userId, filePath);

        const stat = await fs.promises.stat(fullPath);
        if (!stat.isFile()) {
            return sendError(reply, RESPONSE_CODES.INVALID_REQUEST, 'Path is not a file');
        }

        const fileName = name || path.basename(filePath);
        reply.header('Content-Disposition', `attachment; filename="${fileName}"`);
        reply.header('Content-Type', 'application/octet-stream'); // Or detect mime type

        const stream = fs.createReadStream(fullPath);
        return reply.send(stream);
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error.message);
    }
};

export const uploadFile = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }
    const userId = (request.user as any).id;

    try {
        const data = await request.file();
        if (!data) {
            return sendError(reply, RESPONSE_CODES.NO_FILE_UPLOADED, 'No file uploaded');
        }

        const extractField = (name: string): string => {
            const field = data.fields[name];
            // @ts-ignore
            return field ? (field.value || field[0]?.value || '') : '';
        };

        const targetPath = extractField('path'); // Directory path
        const customName = extractField('name');
        const fileName = customName || data.filename;

        // Ensure user directory exists
        await FileService.ensureUserDir(userId);

        // Get safe target directory
        // If targetPath is empty, assume root? Or safePath handles it?
        // getSafePath normalizes. "" -> root.
        const targetDir = FileService.getSafePath(userId, targetPath || '');

        // Create target directory if it doesn't exist?
        // Spec doesn't strictly say auto-create, but for upload it's simpler.
        try {
            await fs.promises.access(targetDir);
        } catch {
            await fs.promises.mkdir(targetDir, { recursive: true });
        }

        const fullPath = path.join(targetDir, fileName);

        await pump(data.file, fs.createWriteStream(fullPath));

        const stats = await fs.promises.stat(fullPath);

        // We need relative path for response
        const userRoot = FileService.getSafePath(userId, ''); // root
        const relativePath = path.relative(userRoot, fullPath);

        return sendSuccess(reply, {
            path: relativePath,
            name: fileName,
            size: stats.size,
            type: path.extname(fileName).slice(1) || 'file',
            created: stats.birthtime.toISOString(),
            updated: stats.mtime.toISOString()
        });

    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error.message);
    }
};
