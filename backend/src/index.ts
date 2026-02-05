import Fastify from 'fastify';
import { bootstrap } from './bootstrap';

const server = Fastify({
  logger: true,
});

const start = async () => {
  try {
    await bootstrap(server);
    await server.listen({ port: 3000 });
    server.log.info(`Server listening on 3000`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
