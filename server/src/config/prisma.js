const isWindowsArm = process.platform === 'win32' && process.arch === 'arm64';

let prisma;

if (!isWindowsArm) {
  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = global.prisma || new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
    if (process.env.NODE_ENV !== 'production') {
      global.prisma = prisma;
    }
  } catch (_e) {
    const { createClient } = require('./pgBridge');
    prisma = global.prisma || createClient();
    if (process.env.NODE_ENV !== 'production') {
      global.prisma = prisma;
    }
  }
} else {
  // On Windows ARM64, Prisma query engine binary is unavailable;
  // seamlessly use native PostgreSQL client directly with the exact same schema.
  const { createClient } = require('./pgBridge');
  prisma = global.prisma || createClient();
  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
  }
}

module.exports = prisma;
