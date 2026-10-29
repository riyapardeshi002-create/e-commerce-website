const prisma = require('../config/prisma');

const FREE_SHIPPING_THRESHOLD = 2000;
const SHIPPING_FEE = 150;

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            sizes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let subtotal = 0;
    const formattedItems = cartItems.map((item) => {
      const activePrice = item.product.salePrice
        ? Number(item.product.salePrice)
        : Number(item.product.price);
      const lineTotal = activePrice * item.quantity;
      subtotal += lineTotal;

      const sizeRecord = item.product.sizes.find((s) => s.size === item.size);
      const availableStock = sizeRecord ? sizeRecord.stockQuantity : 0;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        slug: item.product.slug,
        brand: item.product.brand,
        category: item.product.category,
        imageUrl: item.product.imageUrl,
        size: item.size,
        quantity: item.quantity,
        unitPrice: activePrice,
        originalPrice: Number(item.product.price),
        lineTotal,
        availableStock,
        inStock: availableStock >= item.quantity,
      };
    });

    const shippingCost = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const totalAmount = subtotal + shippingCost;

    res.json({
      success: true,
      data: {
        items: formattedItems,
        itemCount: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0),
        subtotal,
        shippingCost,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
        totalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, size, quantity = 1 } = req.body;

    if (!productId || size === undefined || size === null) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and shoe size are required.',
      });
    }

    const requestedQty = Math.max(1, parseInt(quantity, 10) || 1);
    const numericSize = parseFloat(size);

    // Verify product and size stock in DB
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        sizes: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const sizeRecord = product.sizes.find((s) => s.size === numericSize);
    if (!sizeRecord) {
      return res.status(400).json({
        success: false,
        message: `Size UK/US ${numericSize} is not available for this shoe.`,
      });
    }

    if (sizeRecord.stockQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: `Size UK/US ${numericSize} is currently out of stock.`,
      });
    }

    // Check existing item in user's cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_size: {
          userId,
          productId,
          size: numericSize,
        },
      },
    });

    let newQuantity = requestedQty;
    if (existingItem) {
      newQuantity = existingItem.quantity + requestedQty;
    }

    if (newQuantity > sizeRecord.stockQuantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${requestedQty} more. Only ${sizeRecord.stockQuantity} item(s) available in stock.`,
      });
    }

    const item = await prisma.cartItem.upsert({
      where: {
        userId_productId_size: {
          userId,
          productId,
          size: numericSize,
        },
      },
      update: {
        quantity: newQuantity,
      },
      create: {
        userId,
        productId,
        size: numericSize,
        quantity: requestedQty,
      },
      include: {
        product: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `Added ${product.name} (Size ${numericSize}) to your bag.`,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItemQuantity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    const requestedQty = parseInt(quantity, 10);
    if (isNaN(requestedQty) || requestedQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1.',
      });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        product: {
          include: { sizes: true },
        },
      },
    });

    if (!cartItem || cartItem.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.',
      });
    }

    const sizeRecord = cartItem.product.sizes.find((s) => s.size === cartItem.size);
    const maxStock = sizeRecord ? sizeRecord.stockQuantity : 0;

    if (requestedQty > maxStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${maxStock} in stock for size ${cartItem.size}.`,
      });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: requestedQty },
    });

    res.json({
      success: true,
      message: 'Cart updated.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem || cartItem.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.',
      });
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Item removed from bag.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
};
