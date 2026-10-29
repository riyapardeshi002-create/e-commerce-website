const prisma = require('../config/prisma');

const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            sizes: { orderBy: { size: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

const toggleWishlistItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.',
      });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });

      return res.json({
        success: true,
        action: 'removed',
        message: 'Product removed from wishlist.',
      });
    }

    const newItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: true,
      },
    });

    res.status(201).json({
      success: true,
      action: 'added',
      message: 'Product saved to your wishlist.',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

const removeWishlistItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const item = await prisma.wishlistItem.findUnique({
      where: { id },
    });

    if (!item || item.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found.',
      });
    }

    await prisma.wishlistItem.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Removed from wishlist.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlistItem,
  removeWishlistItem,
};
