const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleWishlistItem,
  removeWishlistItem,
} = require('../controllers/wishlist.controller');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', getWishlist);
router.post('/', toggleWishlistItem);
router.delete('/:id', removeWishlistItem);

module.exports = router;
