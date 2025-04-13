import createApp from './app';
import env from './config/env';
import logger from './utils/logger';
import { connectDB, closeDB } from './config/database';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    const app = createApp();
    const PORT = env.PORT;

    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close(async () => {
        logger.info('Express server closed');
        await closeDB();
        process.exit(0);
      });
      
      // Force close after 10s
      setTimeout(() => {
        logger.error('Could not close connections in time, forcing shutdown');
        process.exit(1);
      }, 10000);
    };

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error('UNHANDLED REJECTION! Shutting down...', err);
      shutdown();
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
      process.exit(1);
    });

    // Handle termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Server failed to start: ${error.message}`);
    }
    process.exit(1);
  }
};

startServer(); 