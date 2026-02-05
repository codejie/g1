import Fastify, { FastifyInstance } from 'fastify';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises'; // Import fs/promises
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
// Removed schedule import
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
// Removed fastifyStatic import
import db from './config/database';
import { ApiError } from './utils/errors';
import { Response, RESPONSE_CODES } from './types/common';
import { setupExampleTask } from './tasks/exampleTask'; // Import task

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads'); // Define upload directory here

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
        request.log.error(error); // Log the error for debugging

        if (error instanceof ApiError) {
            const response: Response = {
                code: error.errorCode as number,
                data: {
                    message: error.message
                }
            };
            reply.code(RESPONSE_CODES.HTTP_OK).send(response);
        } else if (error && (error as any).validation) { // Fastify validation errors
            const response: Response = {
                code: RESPONSE_CODES.VALIDATION_ERROR,
                data: {
                    message: (error as any).message || 'Validation error'
                }
            };
            reply.code(RESPONSE_CODES.HTTP_OK).send(response);
        } else {
            // Generic server error
            const response: Response = {
                code: RESPONSE_CODES.INTERNAL_ERROR,
                data: {
                    message: 'Internal Server Error'
                }
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
            const routesPath = path.join(modulePath, `routes.ts`);
            if (fs.existsSync(routesPath)) {
                const routeModule = await import(routesPath);
                server.register(routeModule.default, { prefix: '/api' });
            }
        }
    }));
}