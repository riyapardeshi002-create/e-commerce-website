const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require('../controllers/orders.controller');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
