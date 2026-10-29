const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    // Attempt database verification
    try {
      await prisma.$connect();
      console.log('✓ PostgreSQL connected successfully via Prisma');

      // Check if product catalogue needs initial auto-seeding
      const currentCount = await prisma.product.count();
      if (currentCount < 50) {
        console.log(`Current product count (${currentCount}) is below 50. Auto-seeding full product catalogue...`);
        const seedDatabase = require('../prisma/seed');
        await seedDatabase();
      } else {
        console.log(`✓ Product catalogue healthy (${currentCount} models available)`);
      }
    } catch (dbErr) {
      console.warn('! Notice: Could not connect to PostgreSQL immediately on startup:');
      console.warn(`  ${dbErr.message}`);
      console.warn('  (Ensure DATABASE_URL is set correctly in .env or Render configuration)');
    }

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  🚀 SOLE Backend API Server Running`);
      console.log(`  📡 Port: http://localhost:${PORT}`);
      console.log(`  🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`  🌍 Environment: ${env.NODE_ENV}`);
      console.log(`===============================================`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('PostgreSQL connection closed. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
