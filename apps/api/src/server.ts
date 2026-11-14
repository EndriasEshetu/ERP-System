import { createApp } from './app.js';
import { env } from './config/env.config.js';
import { prisma } from './database/prisma.service.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`====================================================`);
  console.log(` ERP Platform Backend API running`);
  console.log(` Environment: ${env.NODE_ENV}`);
  console.log(` Local URL:   http://localhost:${env.PORT}${env.API_PREFIX}`);
  console.log(` Healthcheck: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  console.log(`====================================================`);
});

// Graceful shutdown
async function handleShutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  });

  // Force shutdown after 10s if not closed
  setTimeout(() => {
    console.error('Forcefully shutting down after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

