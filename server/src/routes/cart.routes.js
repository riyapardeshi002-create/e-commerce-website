const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
} = require('../controllers/cart.controller');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', getCart);
router.post('/', addToCart);
router.patch('/:id', updateCartItemQuantity);
router.delete('/:id', removeCartItem);

module.exports = router;
