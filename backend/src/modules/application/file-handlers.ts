import { FastifyRequest, FastifyReply } from 'fastify';
import { 
    FileUploadRequest, FileUploadResponse,
    FileDownloadRequest, FileDownloadResponse,
    GetApplicationFilesRequest, GetApplicationFilesResponse,
    DeleteFileRequest, DeleteFileResponse
} from '../../types/application';
import { RESPONSE_CODES } from '../../types/common';
import { ApplicationModel, AppFileModel } from './model';
import { sendSuccess, sendError } from '../../utils/response';
import path from 'path';
import config from '../../config';
import fs from 'fs/promises';

const UPLOAD_DIR = config.UPLOAD_DIR;

// Simple mime type mapping
function getMimeType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
        'txt': 'text/plain',
        'json': 'application/json',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
        'zip': 'application/zip',
        'yaml': 'application/x-yaml',
        'yml': 'application/x-yaml'
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
}

// File Upload handler
export const fileUpload = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    if (!request.isMultipart()) {
        return sendError(reply, RESPONSE_CODES.INVALID_MULTIPART_REQUEST, 'Request is not multipart');
    }

    const file = await request.file();
    if (!file) {
        return sendError(reply, RESPONSE_CODES.NO_FILE_UPLOADED, 'No file uploaded');
    }

    const fields: any = await file.fields;
    const applicationId = fields.application_id?.value || fields.application_id;

    if (!applicationId) {
        return sendError(reply, RESPONSE_CODES.INVALID_REQUEST, 'Application ID is required');
    }

    const app = await ApplicationModel.findById(parseInt(applicationId));
    if (!app) {
        return sendError(reply, RESPONSE_CODES.APPLICATION_NOT_FOUND, 'Application not found');
    }

    if (app.user_id !== request.user.id) {
        return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Access denied: You do not own this application');
    }

    const fileName = file.filename;
    const filePath = path.join(UPLOAD_DIR, `app_${applicationId}`, fileName);

    try {
        const buffer = await file.toBuffer();
        
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, buffer);

        const fileRecord = await AppFileModel.create({
            user_id: request.user.id,
            application_id: app.id,
            name: fileName,
            path: filePath,
            size: BigInt(buffer.length),
            type: getMimeType(fileName),
            disabled: 0
        });

        return sendSuccess(reply, { file: fileRecord });
    } catch (error: any) {
        request.log.error(error);
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, 'Failed to upload file: ' + error.message);
    }
};

// File Download handler
export const fileDownload = async (request: FastifyRequest<{ Body: FileDownloadRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { file_id } = request.body;

    const file = await AppFileModel.findById(file_id);
    if (!file) {
        return sendError(reply, RESPONSE_CODES.FILE_NOT_FOUND, 'File not found');
    }

    if (file.user_id !== request.user.id) {
        return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Access denied: You do not own this file');
    }

    try {
        const fileBuffer = await fs.readFile(file.path);
        const mimeType = getMimeType(file.name);

        reply.header('Content-Disposition', `attachment; filename="${file.name}"`);
        reply.type(mimeType);
        reply.send(fileBuffer);
    } catch (error: any) {
        request.log.error(error);
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, 'Failed to download file: ' + error.message);
    }
};

// Get Application Files handler
export const getApplicationFiles = async (request: FastifyRequest<{ Body: GetApplicationFilesRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { application_id } = request.body;
    const page_info = request.body.page_info || {};
    const { page = 1, size = 10 } = page_info;

    const application = await ApplicationModel.findById(application_id);
    if (!application) {
        return sendError(reply, RESPONSE_CODES.APPLICATION_NOT_FOUND, 'Application not found');
    }

    if (application.user_id !== request.user.id) {
        return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Access denied: You do not own this application');
    }

    const files = await AppFileModel.findByApplicationId(application_id);
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedFiles = files.slice(startIndex, endIndex);

    return sendSuccess(reply, {
        items: paginatedFiles,
        page_info: { page, size, total: files.length }
    });
};

// Delete File handler
export const deleteFile = async (request: FastifyRequest<{ Body: DeleteFileRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { file_id } = request.body;

    const file = await AppFileModel.findById(file_id);
    if (!file) {
        return sendError(reply, RESPONSE_CODES.FILE_NOT_FOUND, 'File not found');
    }

    if (file.user_id !== request.user.id) {
        return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Access denied: You do not own this file');
    }

    try {
        await fs.unlink(file.path);

        const success = await AppFileModel.delete(file_id);

        if (!success) {
            return sendError(reply, RESPONSE_CODES.FILE_NOT_FOUND, 'File not found');
        }

        return sendSuccess(reply, { message: 'File deleted successfully' });
    } catch (error: any) {
        request.log.error(error);
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, 'Failed to delete file: ' + error.message);
    }
};