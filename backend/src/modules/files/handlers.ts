import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs';
import path from 'path';
import * as tar from 'tar';
import config from '../../config/index.js';
import { DownloadRequest, GetInfoRequest, UploadReqeust } from '../../types/files.js';
import { RESPONSE_CODES } from '../../types/common.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { FilesModel } from './model.js';

// Download file metadata and stream actual file
export const downloadFile = async (
    request: FastifyRequest<{ Body: DownloadRequest }>,
    reply: FastifyReply
) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { id } = request.body;

    try {
        const file = await FilesModel.findById(id);
        if (!file) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'File not found');
        }

        if (file.user_id !== userId) {
            return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Not authorized to access this file');
        }

        // build disk path: FILES_ROOT/{user_id}/{path}/{name}
        const fsRoot = config.FILES_ROOT;
        const filePath = path.join(fsRoot, String(userId), file.path, file.name);

        if (!fs.existsSync(filePath)) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'Physical file missing');
        }

        // Check if type is directory
        if (file.type === 'directory') {
            const archiveName = `${file.name}.tar.gz`;
            reply.header('Content-Disposition', `attachment; filename="${archiveName}"`);
            reply.header('Content-Type', 'application/gzip');

            const archive = tar.create({
                gzip: true,
                cwd: path.dirname(filePath)
            }, [path.basename(filePath)]);

            return reply.send(archive);
        }

        // set headers and stream for regular files
        reply.header('Content-Disposition', `attachment; filename="${file.name}"`);
        return reply.send(fs.createReadStream(filePath));
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to download file');
    }
};

// Get file info
export const getFileInfo = async (
    request: FastifyRequest<{ Body: GetInfoRequest }>,
    reply: FastifyReply
) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { id } = request.body as GetInfoRequest;

    try {
        const file = await FilesModel.findById(id);
        if (!file) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'File not found');
        }

        if (file.user_id !== userId) {
            return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Not authorized to access this file');
        }

        return sendSuccess(reply, file);
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to get file info');
    }
};

export const uploadFile = async (
    request: FastifyRequest<{ Body: UploadReqeust }>,
    reply: FastifyReply
) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { id, content } = request.body;

    try {
        const file = await FilesModel.findById(id);
        if (!file) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'File not found');
        }

        if (file.user_id !== userId) {
            return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Not authorized to access this file');
        }

        const fsRoot = config.FILES_ROOT;
        const filePath = path.join(fsRoot, String(userId), file.path, file.name);

        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(filePath, content, 'utf8');

        const updatedFile = await FilesModel.update(id, {});
        return sendSuccess(reply, updatedFile);
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to upload file');
    }
};
