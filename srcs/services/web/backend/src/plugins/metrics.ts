import fp from 'fastify-plugin';
import * as prom from 'prom-client';

export default fp(async (app) => {
  prom.collectDefaultMetrics();

  app.get('/metrics', async (_req, reply) => {
    reply
      .header('Content-Type', prom.register.contentType)
      .send(await prom.register.metrics());
  });
});
