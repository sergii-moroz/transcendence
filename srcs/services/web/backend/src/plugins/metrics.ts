import fp from 'fastify-plugin';
import {
  Counter,
  Histogram,
  collectDefaultMetrics,
  register,
} from 'prom-client';


declare module 'fastify' {
  interface FastifyRequest {
    _startAt: [number, number];
    routerPath?: string;
  }
}

export default fp(async (app) => {
  collectDefaultMetrics();


  const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'code'],
  });


  const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request latency in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  });


  app.addHook('onRequest', (req, _reply, done) => {
    req._startAt = process.hrtime();
    done();
  });


  app.addHook('onResponse', (req, reply, done) => {
    const route = req.routerPath ?? req.raw.url ?? 'unknown_route';

    const labels = {
      method: req.method,
      route,
      code: reply.statusCode,
    };

    httpRequestsTotal.inc(labels);

    const diff = process.hrtime(req._startAt);
    const duration = diff[0] + diff[1] / 1e9; 
    httpRequestDuration.observe(labels, duration);

    done();
  });

  app.get('/metrics', async (_req, reply) => {
    reply
      .header('Content-Type', register.contentType)
      .send(await register.metrics());
  });
});
