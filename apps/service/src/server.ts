// apps/api/src/server.ts
//--------------------------------------------------
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import authPlugin from './auth';
import feedbackRoutes from './routes/feedback';

const app = Fastify({ logger: true })
  .withTypeProvider<TypeBoxTypeProvider>();

app.register(fastifySwagger, {
  openapi: {
    info: { title: 'Feedback API', version: '0.2.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer' }
      }
    },
    security: [{ bearerAuth: [] }]
  }
});
app.register(fastifySwaggerUI, { routePrefix: '/docs' });

/*--- plugins & routes ---*/
app.register(authPlugin);
app.register(feedbackRoutes);

/*--- start ---*/
app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`API listening on ${address}`);
});
