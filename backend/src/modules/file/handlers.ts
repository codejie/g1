import { FastifyRequest, FastifyReply } from 'fastify';
import { UploadRequest, UploadResponse, DownloadRequest } from '../../types/file';
import { Response, RESPONSE_CODES } from '../../types/common';
import { ApiError } from '../../utils/errors';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { FileModel } from './model';

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads'); // Define upload directory

// Simple mime type mapping
const getMimeType = (fileName: string): string => {
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
};

export const uploadFile = async (request: FastifyRequest, reply: FastifyReply) => {
    // Check if multipart is enabled
    if (!request.isMultipart()) {
        throw ApiError.badRequest('Request is not multipart', RESPONSE_CODES.INVALID_MULTIPART_REQUEST);
    }

    const file = await request.file();
    if (!file) {
        throw ApiError.badRequest('No file uploaded', RESPONSE_CODES.NO_FILE_UPLOADED);
    }

    const fileName = `${file.filename}`; // Keep original filename for now, add UUID later for uniqueness
    const filePath = path.join(UPLOAD_DIR, fileName);

    try {
        const buffer = await file.toBuffer();
        await fs.writeFile(filePath, buffer);

        // Store file information in database
        const fileRecord = await FileModel.create({
            id: uuidv4(),
            fileName,
            filePath,
            size: buffer.length,
            mimetype: getMimeType(fileName),
            created: new Date(),
            updated: new Date()
        });

        const response: UploadResponse = {
            code: RESPONSE_CODES.SUCCESS,
            data: {
                fileName: fileRecord.fileName,
                filePath: fileRecord.filePath,
                size: fileRecord.size,
                mimetype: fileRecord.mimetype,
            }
        };
        reply.code(RESPONSE_CODES.HTTP_OK).send(response);
    } catch (error) {
        request.log.error(error);
        throw ApiError.internal('Failed to upload file');
    }
};

export const downloadFile = async (request: FastifyRequest<{ Body: DownloadRequest }>, reply: FastifyReply) => {
    const { fileName } = request.body;
    const filePath = path.join(UPLOAD_DIR, fileName);

    try {
        const fileBuffer = await fs.readFile(filePath); // Read file into buffer
        const mimeType = getMimeType(fileName);

        reply.header('Content-Disposition', `attachment; filename="${fileName}"`);
        reply.type(mimeType);
        reply.send(fileBuffer); // Send the buffer directly

    } catch (error) {
        request.log.error(error);
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            throw ApiError.notFound('File not found', RESPONSE_CODES.FILE_NOT_FOUND);
        }
        throw ApiError.internal('Failed to download file');
    }
};