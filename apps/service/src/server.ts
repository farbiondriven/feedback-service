// apps/api/src/server.ts
//--------------------------------------------------
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import feedbackRoutes from './routes/feedback';

export async function buildApp() {
  const app = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

  await app.register(fastifySwagger, {
    openapi: {
      info: { title: 'Feedback API', version: '0.2.0' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });
  await app.register(fastifySwaggerUI, { routePrefix: '/docs' });

  /*--- plugins & routes ---*/
  await app.register(feedbackRoutes);
  return app;
}

if (require.main === module) {
  (async () => {
    const app = await buildApp();
    await app.listen({ port: +process.env.PORT! || 3000, host: '0.0.0.0' });
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
