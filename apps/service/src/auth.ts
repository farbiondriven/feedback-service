import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';

const authPlugin: FastifyPluginAsync = async (app) => {
  app.decorate(
    'verifyAdmin',
    async (request: any, reply) => {
      const token = request.headers['authorization']?.replace(/^Bearer\s*/i, '') ?? '';
      if (token !== process.env.ADMIN_TOKEN) {
        reply.code(401).send({ error: 'Unauthorized' });
        // stop the request here
        return reply;
      }
    }
  );
};

export default fp(authPlugin);
