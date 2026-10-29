const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');

router.get('/', async (req, res) => {
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
  } catch (err) {
    dbStatus = 'disconnected';
    return res.status(503).json({
      status: 'degraded',
      service: 'SOLE API Server',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: 'Database connection failed',
    });
  }

  res.status(200).json({
    status: 'ok',
    service: 'SOLE API Server',
    database: dbStatus,
    dbLatency: `${dbLatencyMs}ms`,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
