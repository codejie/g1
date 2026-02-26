import { FastifyRequest, FastifyReply } from 'fastify';
import {
    StudioListRequest, StudioListResponse,
    CreateStudioRequest, CreateStudioResponse,
    UpdateStudioRequest, UpdateStudioResponse,
    DeleteStudioRequest, DeleteStudioResponse,
    StudioMembersRequest, StudioMembersResponse,
    AddStudioMemberRequest, AddStudioMemberResponse,
    RemoveStudioMemberRequest, RemoveStudioMemberResponse,
    UpdateStudioMemberRequest, UpdateStudioMemberResponse
} from '../../types/studio.js';
import type { Response } from '../../types/common.js';
import { RESPONSE_CODES } from '../../types/common.js';
import { StudioModel, StudioMemberModel } from './model.js';
import { UserModel } from '../user/model.js';
import { ApiError } from '../../utils/errors.js';

// Studio List handler
export const studioList = async (request: FastifyRequest<{ Body: StudioListRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        throw ApiError.unauthorized('Authentication required', RESPONSE_CODES.UNAUTHORIZED);
    }

    const page_info = request.body.page_info || {};
    const { page = 1, size = 10, sort, filter } = page_info;

    const { studios, total } = await StudioModel.findAll({ page, size, sort, filter });

    const response: StudioListResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            items: studios,
            page_info: {
                page,
                size,
                total
            }
        }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(response);
};

// Create Studio handler
export const createStudio = async (request: FastifyRequest<{ Body: CreateStudioRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        throw ApiError.unauthorized('Authentication required', RESPONSE_CODES.UNAUTHORIZED);
    }

    const { name, description } = request.body;

    // Check if studio name already exists
    const existingStudio = await StudioModel.findByName(name);
    if (existingStudio) {
        throw ApiError.conflict('Studio with this name already exists', RESPONSE_CODES.STUDIO_ALREADY_EXISTS);
    }

    // Create studio
    const studio = await StudioModel.create({
        name,
        description,
        disabled: 0
    });

    // Add user as owner
    const member = await StudioMemberModel.addMember({
        user_id: request.user.id,
        studio_id: studio.id,
        role: 'owner',
        is_default: false,
        is_owner: true
    });

    const response: CreateStudioResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            studio: { ...studio, created: new Date(studio.created), updated: new Date(studio.updated) }
        }
    };
    reply.code(RESPONSE_CODES.HTTP_CREATED).send(response);
};

// Update Studio handler
export const updateStudio = async (request: FastifyRequest<{ Body: UpdateStudioRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        throw ApiError.unauthorized('Authentication required', RESPONSE_CODES.UNAUTHORIZED);
    }

    const { id, name, description, disabled } = request.body;

    // Check if user is owner of this studio
    const member = await StudioMemberModel.findByUserIdStudioId(request.user.id, id);
    if (!member || !member.is_owner) {
        throw ApiError.forbidden('Access denied. Only studio owners can update studios.', RESPONSE_CODES.STUDIO_ACCESS_DENIED);
    }

    // Check if new name conflicts with existing studio (excluding current one)
    if (name && name !== member.studio_id.toString()) {
        const existingStudio = await StudioModel.findByName(name);
        if (existingStudio && existingStudio.id !== id) {
            throw ApiError.conflict('Studio with this name already exists', RESPONSE_CODES.STUDIO_ALREADY_EXISTS);
        }
    }

    const updatedStudio = await StudioModel.update(id, { name, description, disabled });

    if (!updatedStudio) {
        throw ApiError.notFound('Studio not found', RESPONSE_CODES.STUDIO_NOT_FOUND);
    }

    const response: UpdateStudioResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            studio: updatedStudio
        }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(response);
};

// Delete Studio handler
export const deleteStudio = async (request: FastifyRequest<{ Body: DeleteStudioRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        throw ApiError.unauthorized('Authentication required', RESPONSE_CODES.UNAUTHORIZED);
    }

    const { id } = request.body;

    // Check if user is owner of this studio
    const member = await StudioMemberModel.findByUserIdStudioId(request.user.id, id);
    if (!member || !member.is_owner) {
        throw ApiError.forbidden('Access denied. Only studio owners can delete studios.', RESPONSE_CODES.STUDIO_ACCESS_DENIED);
    }

    const success = await StudioModel.delete(id);

    if (!success) {
        throw ApiError.notFound('Studio not found', RESPONSE_CODES.STUDIO_NOT_FOUND);
    }

    const response: DeleteStudioResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            message: 'Studio deleted successfully'
        }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(response);
};

// Get Studio Members handler
export const getStudioMembers = async (request: FastifyRequest<{ Body: StudioMembersRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        throw ApiError.unauthorized('Authentication required', RESPONSE_CODES.UNAUTHORIZED);
    }

    const { studio_id } = request.body;
    const page_info = request.body.page_info || {};
    const { page = 1, size = 10 } = page_info;

    // Check if user is member of this studio
    const member = await StudioMemberModel.findByUserIdStudioId(request.user.id, studio_id);
    if (!member) {
        throw ApiError.forbidden('Access denied. You are not a member of this studio.', RESPONSE_CODES.STUDIO_ACCESS_DENIED);
    }

    const items = await StudioMemberModel.findByStudioId(studio_id);
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedItems = items.slice(startIndex, endIndex);

    const response: StudioMembersResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            items: paginatedItems,
            page_info: {
                page,
                size,
                total: items.length
            }
        }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(response);
};

// Add Studio Member handler
export const addStudioMember = async (request: FastifyRequest<{ Body: AddStudioMemberRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        throw ApiError.unauthorized('Authentication required', RESPONSE_CODES.UNAUTHORIZED);
    }

    const { studio_id, user_email, role = 'member', is_owner = false } = request.body;

    // Check if user is owner of this studio
    const member = await StudioMemberModel.findByUserIdStudioId(request.user.id, studio_id);
    if (!member || !member.is_owner) {
        throw ApiError.forbidden('Access denied. Only studio owners can add members.', RESPONSE_CODES.STUDIO_ACCESS_DENIED);
    }

    // Find user by email
    const userToAdd = await UserModel.findByEmail(user_email);
    if (!userToAdd) {
        throw ApiError.notFound('User not found', RESPONSE_CODES.USER_NOT_FOUND);
    }

    // Add member
    const newMember = await StudioMemberModel.addMember({
        user_id: userToAdd.id,
        studio_id,
        role,
        is_default: false,
        is_owner
    });

    const response: AddStudioMemberResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            member: newMember
        }
    };
    reply.code(RESPONSE_CODES.HTTP_CREATED).send(response);
};

// Remove Studio Member handler
export const removeStudioMember = async (request: FastifyRequest<{ Body: RemoveStudioMemberRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        throw ApiError.unauthorized('Authentication required', RESPONSE_CODES.UNAUTHORIZED);
    }

    const { studio_id, user_id } = request.body;

    // Check if user is owner of this studio
    const member = await StudioMemberModel.findByUserIdStudioId(request.user.id, studio_id);
    if (!member || !member.is_owner) {
        throw ApiError.forbidden('Access denied. Only studio owners can remove members.', RESPONSE_CODES.STUDIO_ACCESS_DENIED);
    }

    // Can't remove yourself if you're the owner
    if (user_id === request.user.id) {
        throw ApiError.forbidden('Studio owners cannot be removed as members', RESPONSE_CODES.STUDIO_OWNER_CANNOT_LEAVE);
    }

    const success = await StudioMemberModel.removeMember(user_id, studio_id);

    if (!success) {
        throw ApiError.notFound('Studio member not found', RESPONSE_CODES.STUDIO_MEMBER_NOT_FOUND);
    }

    const response: RemoveStudioMemberResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            message: 'Member removed successfully'
        }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(response);
};

// Update Studio Member handler
export const updateStudioMember = async (request: FastifyRequest<{ Body: UpdateStudioMemberRequest }>, reply: FastifyReply) => {
    if (!request.user) {
        throw ApiError.unauthorized('Authentication required', RESPONSE_CODES.UNAUTHORIZED);
    }

    const { studio_id, user_id, role, is_owner } = request.body;

    // Check if current user is owner of this studio
    const currentMember = await StudioMemberModel.findByUserIdStudioId(request.user.id, studio_id);
    if (!currentMember || !currentMember.is_owner) {
        throw ApiError.forbidden('Access denied. Only studio owners can update member roles.', RESPONSE_CODES.STUDIO_ACCESS_DENIED);
    }

    // Can't change your own ownership status if you're the primary owner
    if (user_id === request.user.id && is_owner === false) {
        throw ApiError.forbidden('Studio owners cannot remove their own ownership', RESPONSE_CODES.STUDIO_OWNER_CANNOT_LEAVE);
    }

    const success = await StudioMemberModel.updateMember(user_id, studio_id, { role, is_owner });

    if (!success) {
        throw ApiError.notFound('Studio member not found', RESPONSE_CODES.STUDIO_MEMBER_NOT_FOUND);
    }

    const updatedMember = await StudioMemberModel.findByUserIdStudioId(user_id, studio_id);

    const response: UpdateStudioMemberResponse = {
        code: RESPONSE_CODES.SUCCESS,
        data: {
            member: updatedMember!
        }
    };
    reply.code(RESPONSE_CODES.HTTP_OK).send(response);
};