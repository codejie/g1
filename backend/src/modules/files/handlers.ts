import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs';
import path from 'path';
import config from '../../config/index.js';
import { DownloadRequest, GetInfoRequest } from '../../types/files.js';
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

        // set headers and stream
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
