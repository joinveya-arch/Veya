import http from 'http';
import app from './app';
import config from './config';
import prisma from './lib/prisma';
import logger from './utils/logger';

// Set up server port
const port = config.PORT;
const server = http.createServer(app);

// Handle uncaught exceptions globally
process.on('uncaughtException', (error: Error) => {
  logger.error('CRITICAL: Uncaught Exception detected! Exiting process...', error);
  process.exit(1);
});

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('CRITICAL: Unhandled Rejection detected! Gracefully shutting down...', reason as Error);
  gracefulShutdown(1);
});

async function startServer() {
  try {
    // 1. Verify Database Connection
    logger.info('Connecting to PostgreSQL database via Prisma...');
    await prisma.$connect();
    logger.info('Database connection established successfully.');

    // 2. Start HTTP Server
    server.listen(port, () => {
      logger.info(`🚀 Server running in [${config.NODE_ENV}] mode on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server due to initialization error:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
function gracefulShutdown(exitCode: number = 0) {
  logger.info('Received shutdown signal. Gracefully closing resources...');

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await prisma.$disconnect();
      logger.info('Prisma database connections closed.');
      process.exit(exitCode);
    } catch (dbError) {
      logger.error('Error during database disconnect:', dbError);
      process.exit(1);
    }
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Force exiting since graceful shutdown timed out.');
    process.exit(1);
  }, 10000);
}

// Bind OS signals
process.on('SIGTERM', () => {
  logger.info('SIGTERM received.');
  gracefulShutdown(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received.');
  gracefulShutdown(0);
});

// Launch server
startServer();
