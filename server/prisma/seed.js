const prisma = require('../src/config/prisma');
const bcrypt = require('bcryptjs');
const PRODUCTS = require('./productsData');

async function seedDatabase() {
  console.log('--- Starting SOLE Database Seeding ---');

  // 1. Seed or Verify Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sole.store';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@SOLE2026!';
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminHash,
      role: 'admin',
    },
    create: {
      name: 'SOLE Store Administrator',
      email: adminEmail,
      passwordHash: adminHash,
      role: 'admin',
    },
  });
  console.log(`✓ Admin user verified: ${admin.email} (Role: ${admin.role})`);

  // 2. Seed or Verify Demo Customer
  const demoEmail = 'customer@sole.store';
  const demoPassword = 'Customer@12345';
  const demoHash = await bcrypt.hash(demoPassword, 12);

  const customer = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      passwordHash: demoHash,
      role: 'customer',
    },
    create: {
      name: 'Riya Demo Customer',
      email: demoEmail,
      passwordHash: demoHash,
      role: 'customer',
    },
  });
  console.log(`✓ Demo customer verified: ${customer.email}`);

  // 3. Seed All 55 Footwear Models Idempotently
  console.log(`Seeding ${PRODUCTS.length} authentic footwear products across 5 categories...`);
  let createdCount = 0;
  let updatedCount = 0;

  for (const p of PRODUCTS) {
    const existing = await prisma.product.findUnique({
      where: { slug: p.slug },
      include: {
        sizes: true,
        images: true,
      },
    });

    if (existing) {
      // Update core details
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: p.name,
          brand: p.brand,
          category: p.category,
          description: p.description,
          price: p.price,
          salePrice: p.salePrice,
          imageUrl: p.imageUrl,
          featured: p.featured,
        },
      });

      // Upsert sizes
      for (const s of p.sizes) {
        const foundSize = existing.sizes?.find((sz) => Math.abs(sz.size - s.size) < 0.01);
        if (foundSize) {
          await prisma.productSize.update({
            where: { id: foundSize.id },
            data: { stockQuantity: s.stock },
          });
        } else {
          await prisma.productSize.create({
            data: {
              productId: existing.id,
              size: s.size,
              stockQuantity: s.stock,
            },
          });
        }
      }

      // Ensure gallery images exist
      if (!existing.images || existing.images.length === 0) {
        for (let i = 0; i < p.images.length; i++) {
          await prisma.productImage.create({
            data: {
              productId: existing.id,
              imageUrl: p.images[i],
              displayOrder: i,
            },
          });
        }
      }

      updatedCount++;
    } else {
      // Create new product with nested sizes and images
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          category: p.category,
          description: p.description,
          price: p.price,
          salePrice: p.salePrice,
          imageUrl: p.imageUrl,
          featured: p.featured,
          sizes: {
            create: p.sizes.map((s) => ({
              size: s.size,
              stockQuantity: s.stock,
            })),
          },
          images: {
            create: p.images.map((img, idx) => ({
              imageUrl: img,
              displayOrder: idx,
            })),
          },
        },
      });
      createdCount++;
    }
  }

  console.log(`✓ Products processing complete: ${createdCount} created, ${updatedCount} updated.`);

  // 4. Create an initial sample demo order if none exists (for analytics preview)
  const testOrderNumber = 'SOLE-20261029-7788';
  const existingOrder = await prisma.order.findUnique({
    where: { orderNumber: testOrderNumber },
  });

  if (!existingOrder) {
    const sampleProduct = await prisma.product.findFirst();
    if (sampleProduct) {
      await prisma.order.create({
        data: {
          orderNumber: testOrderNumber,
          userId: customer.id,
          customerName: customer.name,
          phone: '+91 98765 43210',
          deliveryAddress: '42 MG Road, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          subtotal: Number(sampleProduct.price),
          shippingCost: 0,
          totalAmount: Number(sampleProduct.price),
          status: 'Confirmed',
          orderItems: {
            create: [
              {
                productId: sampleProduct.id,
                productNameSnapshot: sampleProduct.name,
                size: 9.0,
                quantity: 1,
                unitPrice: Number(sampleProduct.price),
                lineTotal: Number(sampleProduct.price),
              },
            ],
          },
        },
      });
      console.log(`✓ Initial sample order verified (${testOrderNumber})`);
    }
  }

  const finalProductCount = await prisma.product.count();
  console.log(`✓ Total products in PostgreSQL database: ${finalProductCount}`);
  console.log('--- Database Seeding Complete ---');
  return finalProductCount;
}

if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error('Error during seeding:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = seedDatabase;
