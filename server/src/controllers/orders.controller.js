const prisma = require('../config/prisma');

const FREE_SHIPPING_THRESHOLD = 2000;
const SHIPPING_FEE = 150;

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      customerName,
      phone,
      deliveryAddress,
      city,
      state,
      postalCode,
      items: directItems, // Can checkout either from DB cart or direct item
    } = req.body;

    // Validate delivery details
    if (!customerName || !phone || !deliveryAddress || !city || !state || !postalCode) {
      return res.status(400).json({
        success: false,
        message: 'All delivery fields (Customer Name, Phone, Address, City, State, Postal Code) are required.',
      });
    }

    // Phone format basic check
    if (!/^\+?[0-9\s-]{8,15}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid contact phone number.',
      });
    }

    // Determine items to order
    let itemsToProcess = [];

    if (Array.isArray(directItems) && directItems.length > 0) {
      itemsToProcess = directItems;
    } else {
      const userCartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            include: { sizes: true },
          },
        },
      });

      if (!userCartItems || userCartItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your shopping cart is empty. Please add items before checking out.',
        });
      }

      itemsToProcess = userCartItems.map((c) => ({
        productId: c.productId,
        size: c.size,
        quantity: c.quantity,
      }));
    }

    // Execute atomic order transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of itemsToProcess) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { sizes: true },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} is no longer available.`);
        }

        const sizeRecord = product.sizes.find((s) => s.size === parseFloat(item.size));
        if (!sizeRecord) {
          throw new Error(`Size ${item.size} for ${product.name} is no longer offered.`);
        }

        if (sizeRecord.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}" in Size ${item.size}. Only ${sizeRecord.stockQuantity} remaining.`
          );
        }

        // Atomically decrement stock
        await tx.productSize.update({
          where: { id: sizeRecord.id },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        const activePrice = product.salePrice ? Number(product.salePrice) : Number(product.price);
        const lineTotal = activePrice * item.quantity;
        subtotal += lineTotal;

        orderItemsData.push({
          productId: product.id,
          productNameSnapshot: product.name,
          size: parseFloat(item.size),
          quantity: item.quantity,
          unitPrice: activePrice,
          lineTotal,
        });
      }

      const shippingCost = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
      const totalAmount = subtotal + shippingCost;

      // Generate unique order number
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `SOLE-${datePart}-${randomPart}`;

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName: customerName.trim(),
          phone: phone.trim(),
          deliveryAddress: deliveryAddress.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          subtotal,
          shippingCost,
          totalAmount,
          status: 'Confirmed', // Demo checkout automatically confirms
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  imageUrl: true,
                  brand: true,
                  slug: true,
                  price: true,
                  salePrice: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Clear user's cart in the database
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return order;
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! (Demo Mode - No real payment charged)',
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                imageUrl: true,
                brand: true,
                slug: true,
                price: true,
                salePrice: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                imageUrl: true,
                brand: true,
                slug: true,
                price: true,
                salePrice: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Customers may only view their own orders; admins can view all
    if (!isAdmin && order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this order.',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
