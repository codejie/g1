import { FastifyRequest, FastifyReply } from 'fastify';
import { GetPrdReportInfoRequest } from '../../types/apps.js';
import { RESPONSE_CODES } from '../../types/common.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AppsModel, AppsPrdReportModel } from './model.js';

export const getAppInfo = async (
    request: FastifyRequest<{ Body: { id: number } }>,
    reply: FastifyReply
) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;
    const { id } = request.body;

    try {
        const app = await AppsModel.findById(id);
        if (!app) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'App not found');
        }

        if (app.user_id !== userId) {
            return sendError(reply, RESPONSE_CODES.FORBIDDEN, 'Not authorized to access this app');
        }

        return sendSuccess(reply, app);
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to get app info');
    }
};

export const getMyApps = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const userId = (request.user as any).id;

    try {
        const apps = await AppsModel.findByUserId(userId);
        return sendSuccess(reply, apps);
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to get apps');
    }
};

export const getPrdReportInfo = async (
    request: FastifyRequest<{ Body: GetPrdReportInfoRequest }>,
    reply: FastifyReply
) => {
    if (!request.user) {
        return sendError(reply, RESPONSE_CODES.UNAUTHORIZED, 'Authentication required');
    }

    const { id } = request.body;

    try {
        const prdReport = await AppsPrdReportModel.findById(id);
        if (!prdReport) {
            return sendError(reply, RESPONSE_CODES.NOT_FOUND, 'PRD report not found');
        }

        return sendSuccess(reply, prdReport);
    } catch (error: any) {
        return sendError(reply, RESPONSE_CODES.INTERNAL_ERROR, error?.message || 'Failed to get prd report info');
    }
};
