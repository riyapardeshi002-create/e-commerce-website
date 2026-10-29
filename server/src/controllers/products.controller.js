const prisma = require('../config/prisma');

const getAllProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      size,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 12,
      featured,
      section,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const skip = (pageNumber - 1) * pageSize;

    const where = {};

    // Search query
    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (category && category.toLowerCase() !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    // Brand filter
    if (brand && brand.toLowerCase() !== 'all') {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    // Featured filter
    if (featured === 'true' || featured === true) {
      where.featured = true;
    }

    // Special sections
    if (section === 'trending') {
      where.featured = true;
    }

    // Price range filter
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min) || !isNaN(max)) {
      where.price = {};
      if (!isNaN(min)) where.price.gte = min;
      if (!isNaN(max)) where.price.lte = max;
    }

    // Size filter (only shoes that have this size with stock > 0)
    if (size) {
      const sizeNum = parseFloat(size);
      if (!isNaN(sizeNum)) {
        where.sizes = {
          some: {
            size: sizeNum,
            stockQuantity: { gt: 0 },
          },
        };
      }
    }

    // Sorting
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'name_asc') {
      orderBy = { name: 'asc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [total, products, allCategories, allBrands] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          sizes: {
            orderBy: { size: 'asc' },
          },
          images: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.product.findMany({
        select: { category: true },
        distinct: ['category'],
      }),
      prisma.product.findMany({
        select: { brand: true },
        distinct: ['brand'],
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages,
        hasMore: pageNumber < totalPages,
      },
      filters: {
        categories: allCategories.map((c) => c.category),
        brands: allBrands.map((b) => b.brand),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        sizes: {
          orderBy: { size: 'asc' },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        sizes: {
          orderBy: { size: 'asc' },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Related products in the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id },
      },
      include: {
        sizes: {
          orderBy: { size: 'asc' },
        },
      },
      take: 4,
    });

    res.json({
      success: true,
      data: {
        ...product,
        relatedProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      brand,
      category,
      description,
      price,
      salePrice,
      imageUrl,
      featured = false,
      sizes = [],
      images = [],
    } = req.body;

    if (!name || !brand || !category || !description || price === undefined || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Name, brand, category, description, price, and imageUrl are required.',
      });
    }

    const generatedSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        brand,
        category,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        imageUrl,
        featured: Boolean(featured),
        sizes: {
          create: sizes.map((s) => ({
            size: parseFloat(s.size),
            stockQuantity: parseInt(s.stockQuantity || 0, 10),
          })),
        },
        images: {
          create: images.map((img, idx) => ({
            imageUrl: typeof img === 'string' ? img : img.imageUrl,
            displayOrder: idx,
          })),
        },
      },
      include: {
        sizes: true,
        images: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      brand,
      category,
      description,
      price,
      salePrice,
      imageUrl,
      featured,
      sizes,
      images,
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // In a transaction, update product fields and recreate/update sizes and images if provided
    const updated = await prisma.$transaction(async (tx) => {
      const data = {};
      if (name !== undefined) data.name = name;
      if (slug !== undefined) data.slug = slug;
      if (brand !== undefined) data.brand = brand;
      if (category !== undefined) data.category = category;
      if (description !== undefined) data.description = description;
      if (price !== undefined) data.price = parseFloat(price);
      if (salePrice !== undefined) data.salePrice = salePrice ? parseFloat(salePrice) : null;
      if (imageUrl !== undefined) data.imageUrl = imageUrl;
      if (featured !== undefined) data.featured = Boolean(featured);

      // If sizes provided, update or recreate
      if (Array.isArray(sizes)) {
        await tx.productSize.deleteMany({ where: { productId: id } });
        await tx.productSize.createMany({
          data: sizes.map((s) => ({
            productId: id,
            size: parseFloat(s.size),
            stockQuantity: parseInt(s.stockQuantity || 0, 10),
          })),
        });
      }

      // If images provided, update or recreate
      if (Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: images.map((img, idx) => ({
            productId: id,
            imageUrl: typeof img === 'string' ? img : img.imageUrl,
            displayOrder: idx,
          })),
        });
      }

      return tx.product.update({
        where: { id },
        data,
        include: {
          sizes: { orderBy: { size: 'asc' } },
          images: { orderBy: { displayOrder: 'asc' } },
        },
      });
    });

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    await prisma.product.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
