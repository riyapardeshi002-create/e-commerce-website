const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products.controller');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// Public endpoints
router.get('/', getAllProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Admin-protected endpoints
router.post('/', authenticateUser, requireAdmin, createProduct);
router.put('/:id', authenticateUser, requireAdmin, updateProduct);
router.delete('/:id', authenticateUser, requireAdmin, deleteProduct);

module.exports = router;
