import { FastifyRequest, FastifyReply } from 'fastify';
import {
    ApplicationListRequest, ApplicationListResponse,
    CreateApplicationRequest, CreateApplicationResponse,
    GetApplicationRequest, GetApplicationResponse,
    UpdateApplicationRequest, UpdateApplicationResponse,
    DeleteApplicationRequest, DeleteApplicationResponse
} from '../../types/application.js';
import { RESPONSE_CODES } from '../../types/common.js';
import { ApplicationModel, AppFileModel } from './model.js';
import { sendSuccess, sendError } from '../../utils/response.js';

// Application List handler
export const applicationList = async (request: FastifyRequest<{ Body: ApplicationListRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const page_info = request.body.page_info || {};
    const { page = 1, size = 10, sort, filter } = page_info;

    const { applications, total } = await ApplicationModel.findAll({ page, size, sort, filter });

    return sendSuccess(reply, {
        items: applications,
        page_info: { page, size, total }
    });
};

// Create Application handler
export const createApplication = async (request: FastifyRequest<{ Body: CreateApplicationRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { type, name, description, icon, status = 'processing' } = request.body;

    const existingApps = await ApplicationModel.findByUserId(request.user.id);
    if (existingApps.some(app => app.name === name)) {
        return sendError(reply, RESPONSE_CODES.APPLICATION_ALREADY_EXISTS, 'Application with this name already exists');
    }

    const application = await ApplicationModel.create({
        user_id: request.user.id,
        type,
        name,
        description,
        icon,
        status,
        disabled: 0
    });

    return sendSuccess(reply, { application });
};

// Get Application handler
export const getApplication = async (request: FastifyRequest<{ Body: GetApplicationRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { id } = request.body;

    const application = await ApplicationModel.findById(id);

    if (!application) {
        return sendError(reply, RESPONSE_CODES.APPLICATION_NOT_FOUND, 'Application not found');
    }

    if (application.user_id !== request.user.id) {
        return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Access denied: You do not own this application');
    }

    return sendSuccess(reply, { application });
};

// Update Application handler
export const updateApplication = async (request: FastifyRequest<{ Body: UpdateApplicationRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { id, type, name, description, icon, status, disabled } = request.body;

    const existingApplication = await ApplicationModel.findById(id);

    if (!existingApplication) {
        return sendError(reply, RESPONSE_CODES.APPLICATION_NOT_FOUND, 'Application not found');
    }

    if (existingApplication.user_id !== request.user.id) {
        return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Access denied: You do not own this application');
    }

    if (name && name !== existingApplication.name) {
        const userApps = await ApplicationModel.findByUserId(request.user.id);
        if (userApps.some(app => app.name === name)) {
            return sendError(reply, RESPONSE_CODES.APPLICATION_ALREADY_EXISTS, 'Application with this name already exists');
        }
    }

    const updateData: Partial<{ type: string; name: string; description: string; icon: string; status: string; disabled: number }> = {};
    if (type !== undefined) updateData.type = type;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (status !== undefined) updateData.status = status;
    if (disabled !== undefined) updateData.disabled = disabled;

    if (status && !['processing', 'completed', 'active', 'inactive'].includes(status)) {
        return sendError(reply, RESPONSE_CODES.APPLICATION_STATUS_INVALID, 'Invalid application status');
    }

    const updatedApplication = await ApplicationModel.update(id, updateData);

    if (!updatedApplication) {
        return sendError(reply, RESPONSE_CODES.APPLICATION_NOT_FOUND, 'Application not found');
    }

    return sendSuccess(reply, { application: updatedApplication });
};

// Delete Application handler
export const deleteApplication = async (request: FastifyRequest<{ Body: DeleteApplicationRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { id } = request.body;

    const existingApplication = await ApplicationModel.findById(id);

    if (!existingApplication) {
        return sendError(reply, RESPONSE_CODES.APPLICATION_NOT_FOUND, 'Application not found');
    }

    if (existingApplication.user_id !== request.user.id) {
        return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Access denied: You do not own this application');
    }

    const success = await ApplicationModel.delete(id);

    if (!success) {
        return sendError(reply, RESPONSE_CODES.APPLICATION_NOT_FOUND, 'Application not found');
    }

    return sendSuccess(reply, { message: 'Application deleted successfully' });
};