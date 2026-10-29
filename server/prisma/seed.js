const prisma = require('../src/config/prisma');
const bcrypt = require('bcryptjs');

const SAMPLE_PRODUCTS = [
  {
    name: 'AirEdge Pro X',
    slug: 'airedge-pro-x',
    brand: 'Nike',
    category: 'Running',
    description: 'Engineered for elite runners who demand peak performance. The AirEdge Pro X features our revolutionary air cushioning system that absorbs shock and propels you forward with every stride. Lightweight breathable mesh upper keeps you cool, while the carbon-composite plate delivers explosive energy return.',
    price: 14999.00,
    salePrice: 12499.00,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
    ],
    sizes: [
      { size: 7.0, stock: 12 },
      { size: 8.0, stock: 18 },
      { size: 9.0, stock: 25 },
      { size: 10.0, stock: 20 },
      { size: 11.0, stock: 8 },
    ],
  },
  {
    name: 'UrbanDrift Classic',
    slug: 'urbandrift-classic',
    brand: 'Adidas',
    category: 'Casual',
    description: 'Where metropolitan street culture meets premium European craftsmanship. The UrbanDrift Classic is built for the everyday city wanderer — versatile enough for office hours, gallery crawls, or weekend escapades. Full grain leather accents with dual-layer cloud comfort sole.',
    price: 9499.00,
    salePrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80',
    ],
    sizes: [
      { size: 6.0, stock: 10 },
      { size: 7.0, stock: 15 },
      { size: 8.0, stock: 30 },
      { size: 9.0, stock: 22 },
      { size: 10.0, stock: 14 },
    ],
  },
  {
    name: 'SpeedForce Elite Nitro',
    slug: 'speedforce-elite-nitro',
    brand: 'Puma',
    category: 'Sports',
    description: 'Break your personal records, not your feet. The SpeedForce Elite delivers unmatched responsiveness with Puma nitrogen-infused foam compound, delivering rapid push-offs on indoor gym floors or outdoor turf.',
    price: 16999.00,
    salePrice: 13999.00,
    imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
    ],
    sizes: [
      { size: 7.0, stock: 8 },
      { size: 8.0, stock: 14 },
      { size: 9.0, stock: 19 },
      { size: 10.0, stock: 11 },
      { size: 11.0, stock: 3 }, // Low stock test
    ],
  },
  {
    name: 'CloudWalk Luxe V3',
    slug: 'cloudwalk-luxe-v3',
    brand: 'New Balance',
    category: 'Casual',
    description: 'All-day comfort meets refined minimalist aesthetics. The CloudWalk Luxe wraps your foot in signature multi-density EVA foam technology, delivering an effortless walking-on-air sensation from dawn till dusk.',
    price: 11299.00,
    salePrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    ],
    sizes: [
      { size: 6.0, stock: 6 },
      { size: 7.0, stock: 12 },
      { size: 8.0, stock: 16 },
      { size: 9.0, stock: 20 },
      { size: 10.0, stock: 15 },
    ],
  },
  {
    name: 'StrikeFlex Multi-Trainer',
    slug: 'strikeflex-multi-trainer',
    brand: 'Nike',
    category: 'Sports',
    description: 'Dominate cross-training workouts, HIIT classes, and weight sessions with rock-solid stability. Features wide toe box, flat heel anchor, and lateral rubber wraps for rope climbing and side cuts.',
    price: 8999.00,
    salePrice: 7499.00,
    imageUrl: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80',
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80',
    ],
    sizes: [
      { size: 8.0, stock: 15 },
      { size: 9.0, stock: 24 },
      { size: 10.0, stock: 18 },
      { size: 11.0, stock: 10 },
    ],
  },
  {
    name: 'RetroJoy 90s Heritage',
    slug: 'retrojoy-90s-heritage',
    brand: 'Reebok',
    category: 'Women',
    description: 'Nostalgia reimagined for modern trendsetters. The RetroJoy 90s brings back chunky silhouette aesthetics, sculpted geometric midsole lines, and throwback colorblocking that defined sneaker subculture.',
    price: 7999.00,
    salePrice: 6499.00,
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
    ],
    sizes: [
      { size: 5.0, stock: 10 },
      { size: 6.0, stock: 18 },
      { size: 7.0, stock: 25 },
      { size: 8.0, stock: 15 },
    ],
  },
  {
    name: 'TerraGrip All-Weather Trail',
    slug: 'terragrip-all-weather-trail',
    brand: 'Salomon',
    category: 'Running',
    description: 'Conquer wet ridges, muddy forest trails, and scree descents. Equipped with deep Contagrip chevron lugs, Quicklace harness, and protective rubber toe cap that guards your feet on harsh terrains.',
    price: 15499.00,
    salePrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    ],
    sizes: [
      { size: 8.0, stock: 12 },
      { size: 9.0, stock: 16 },
      { size: 10.0, stock: 14 },
      { size: 11.0, stock: 6 },
    ],
  },
  {
    name: 'VelvetStep High Top',
    slug: 'velvetstep-high-top',
    brand: 'Converse',
    category: 'Men',
    description: 'An iconic silhouette elevated with supple black canvas, metallic eyelets, OrthoLite insole cushioning, and a vulcanized rubber outsole designed to withstand years of everyday wear.',
    price: 5499.00,
    salePrice: 4699.00,
    imageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
    ],
    sizes: [
      { size: 7.0, stock: 20 },
      { size: 8.0, stock: 35 },
      { size: 9.0, stock: 40 },
      { size: 10.0, stock: 25 },
      { size: 11.0, stock: 15 },
    ],
  },
  {
    name: 'AeroGlide Carbon Marathon',
    slug: 'aeroglide-carbon-marathon',
    brand: 'Nike',
    category: 'Running',
    description: 'Engineered specifically for half and full marathon distances. Full-length curved carbon plate nestled between ultra-light PEBA foam pushes your pace forward with effortless efficiency.',
    price: 18999.00,
    salePrice: 16999.00,
    imageUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80',
    ],
    sizes: [
      { size: 8.0, stock: 7 },
      { size: 9.0, stock: 12 },
      { size: 10.0, stock: 8 },
    ],
  },
  {
    name: 'CourtPulse Pro Ace',
    slug: 'courtpulse-pro-ace',
    brand: 'Adidas',
    category: 'Sports',
    description: 'Court-tested tennis and badminton performance shoe. Features abrasion-resistant Adituff toe wrap, Torsion system support for fast lateral pivots, and non-marking Adiwear compound.',
    price: 10999.00,
    salePrice: 8999.00,
    imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80',
    ],
    sizes: [
      { size: 7.0, stock: 14 },
      { size: 8.0, stock: 19 },
      { size: 9.0, stock: 15 },
      { size: 10.0, stock: 12 },
    ],
  },
  {
    name: 'SolePure Minimalist Slip',
    slug: 'solepure-minimalist-slip',
    brand: 'Puma',
    category: 'Casual',
    description: 'Zero distraction, instant step-in ease. Engineered knit bootie construction wraps like a sock with lightweight heel stabilizer and flexible groove outsole.',
    price: 4999.00,
    salePrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80',
    ],
    sizes: [
      { size: 6.0, stock: 15 },
      { size: 7.0, stock: 20 },
      { size: 8.0, stock: 25 },
      { size: 9.0, stock: 20 },
    ],
  },
  {
    name: 'Zenith Stride Runner',
    slug: 'zenith-stride-runner',
    brand: 'New Balance',
    category: 'Men',
    description: 'Maximalist cushioning for recovery jogs and high-mileage training blocks. High-stack Fresh Foam midsole creates soft, pillow-like landings without sacrificing stability.',
    price: 13499.00,
    salePrice: 11999.00,
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80',
    ],
    sizes: [
      { size: 8.0, stock: 10 },
      { size: 9.0, stock: 18 },
      { size: 10.0, stock: 14 },
      { size: 11.0, stock: 9 },
    ],
  },
];

async function main() {
  console.log('--- Seeding SOLE E-commerce Database ---');

  // Seed Admin User (Configurable via environment variables)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@sole.store';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminHash,
      role: 'admin',
    },
    create: {
      name: 'SOLE Admin',
      email: adminEmail,
      passwordHash: adminHash,
      role: 'admin',
    },
  });
  console.log(`✓ Admin user verified: ${admin.email} (Role: ${admin.role})`);

  // Seed Demo Customer
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

  // Seed Products and Sizes
  console.log(`Seeding ${SAMPLE_PRODUCTS.length} footwear products...`);
  for (const p of SAMPLE_PRODUCTS) {
    const existing = await prisma.product.findUnique({
      where: { slug: p.slug },
    });

    if (existing) {
      // Update basic fields
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
    } else {
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
    }
  }

  console.log('✓ All 12 products and size variants seeded successfully.');

  // Create an initial sample demo order for the demo customer to populate dashboard charts
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
      console.log(`✓ Initial sample order created for analytics preview (${testOrderNumber})`);
    }
  }

  console.log('--- Database Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
