import { FastifyInstance } from 'fastify';

export const setupExampleTask = (server: FastifyInstance) => {
    server.log.info('Setting up example scheduled task...');

    setInterval(() => {
        server.log.info('Running example scheduled task: This message is logged every minute.');
    }, 60000); // Every 1 minute (60000 ms)

    server.log.info('Example scheduled task added using setInterval.');
};
