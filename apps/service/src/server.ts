import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import feedbackRoutes from './routes/feedback';

const isProduction = process.env.NODE_ENV === 'production';

export async function buildApp() {
  const app = Fastify({
    logger: true,
    trustProxy: true,
  }).withTypeProvider<TypeBoxTypeProvider>();
  await app.register(fastifySwagger, {
    openapi: {
      info: { title: 'Feedback API', version: '0.2.0' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer' },
        },
      },
      security: [{ bearerAuth: [] }],
      ...(isProduction ? { servers: [{ url: '/api' }] } : {}),
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
    await app.listen({
      port: +process.env.BACKEND_PORT! || 3000,
      host: '0.0.0.0',
    });
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
