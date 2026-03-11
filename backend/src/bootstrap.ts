import { fileURLToPath, pathToFileURL } from 'url';
import Fastify, { FastifyInstance } from 'fastify';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import db from './config/database.js';
import type { BaseResponse } from './types/common.js';
import { RESPONSE_CODES } from './types/common.js';
import config from './config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = config.UPLOAD_DIR;

export const bootstrap = async (server: FastifyInstance) => {
    // Ensure upload directory exists
    await fsPromises.mkdir(UPLOAD_DIR, { recursive: true });

    // Initialize database
    await db.init();

    // Add database to fastify instance for access in routes
    server.decorate('db', db);

    // register plugins
    await server.register(cors, { origin: '*' });
    await server.register(multipart);
    // Removed schedule registration
    await server.register(swagger, {
        swagger: {
            info: {
                title: 'Backend API',
                description: 'RESTful API for backend service.',
                version: '1.0.0',
            },
            host: 'localhost:3000',
            schemes: ['http'],
            consumes: ['application/json', 'multipart/form-data'],
            produces: ['application/json'],
            securityDefinitions: {
                bearerAuth: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header',
                    description: 'JWT token authorization'
                }
            },
            security: [{ bearerAuth: [] }]
        },
    });
    await server.register(swaggerUi, {
        routePrefix: '/documentation',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false,
        },
    });

    // setup scheduled tasks
    // setupExampleTask(server); // Setup example task
    // Removed server.scheduler.start();

    server.setErrorHandler((error, request, reply) => {
        request.log.error(error);

        if (error && (error as any).validation) {
            const response: BaseResponse = {
                code: RESPONSE_CODES.VALIDATION_ERROR,
                message: (error as any).message || 'Validation error',
                data: undefined
            };
            reply.code(RESPONSE_CODES.HTTP_OK).send(response);
        } else {
            const err = error as any;
            const response: BaseResponse = {
                code: RESPONSE_CODES.INTERNAL_ERROR,
                message: err?.message || 'Internal Server Error',
                data: undefined
            };
            reply.code(RESPONSE_CODES.HTTP_OK).send(response);
        }
    });


    // register routes
    const modulesPath = path.join(__dirname, 'modules');
    const moduleFiles = fs.readdirSync(modulesPath);

    await Promise.all(moduleFiles.map(async module => {
        const modulePath = path.join(modulesPath, module);
        if (fs.statSync(modulePath).isDirectory()) {
            const routesPaths = [
                path.join(modulePath, `routes.js`),
                path.join(modulePath, `routes.ts`)
            ];
            const existingPath = routesPaths.find(p => fs.existsSync(p));
            if (existingPath) {
                const routeModule = await import(pathToFileURL(existingPath).href);
                server.register(routeModule.default, { prefix: '/api' });
            }
        }
    }));
}
