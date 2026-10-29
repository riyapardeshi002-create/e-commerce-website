const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
} = require('../controllers/admin.controller');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// All admin routes strictly require authentication AND admin role
router.use(authenticateUser, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/customers', getAllCustomers);

module.exports = router;
