import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  console.log('Clearing existing data...');
  // Delete in order of dependencies
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Milin Shop database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@milinshop.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Milin',
      role: 'ADMIN',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
      profile: {
        create: {
          bio: 'Milin Shop Administrator',
          country: 'Thailand',
          city: 'Bangkok',
        },
      },
    },
  });

  // Create test customers
  const customer1Password = await bcrypt.hash('Customer@123456', 10);
  const customer1 = await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      password: customer1Password,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+66812345678',
      role: 'USER',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
      profile: {
        create: {
          bio: 'Fashion lover',
          country: 'Thailand',
          city: 'Bangkok',
          address: '123 Sukhumvit Rd',
        },
      },
      cart: {
        create: {},
      },
    },
  });

  const customer2Password = await bcrypt.hash('Customer@123456', 10);
  const customer2 = await prisma.user.create({
    data: {
      email: 'emma@example.com',
      password: customer2Password,
      firstName: 'Emma',
      lastName: 'Williams',
      phone: '+66887654321',
      role: 'USER',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
      profile: {
        create: {
          bio: 'Luxury fashion enthusiast',
          country: 'Thailand',
          city: 'Bangkok',
          address: '456 Silom Rd',
        },
      },
      cart: {
        create: {},
      },
    },
  });

  // Create categories
  const eveningWearCategory = await prisma.category.create({
    data: {
      name: 'Evening Wear',
      slug: 'evening-wear',
      description: 'Elegant gowns for special occasions',
    },
  });

  const dressesCategory = await prisma.category.create({
    data: {
      name: 'Dresses',
      slug: 'dresses',
      parentId: eveningWearCategory.id,
    },
  });

  const blazersCategory = await prisma.category.create({
    data: {
      name: 'Blazers & Jackets',
      slug: 'blazers',
      description: 'Designer blazers and jackets for professional and casual wear',
    },
  });

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Handbags, jewelry, and accessories',
    },
  });

  // Create luxury women's fashion products
  const products = await Promise.all(
    [
      {
        title: 'Chanel Classic Black Evening Gown',
        slug: 'chanel-black-evening-gown',
        description: 'Stunning black silk evening gown with intricate hand-sewn beading and delicate embroidery. Perfect for galas and formal events. Features elegant Cape neckline and flowing silhouette.',
        categoryId: dressesCategory.id,
        dailyPrice: 2500,
        depositPrice: 8000,
        stock: 2,
        colors: ['Black'],
        sizes: ['XS', 'S', 'M'],
        material: 'Silk Chiffon',
        condition: 'LIKE_NEW',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop',
            alt: 'Chanel Black Evening Gown',
            order: 0,
          },
        ],
      },
      {
        title: 'Valentino Red Silk Dress',
        slug: 'valentino-red-silk-dress',
        description: 'Iconic Valentino red silk dress perfect for special occasions. Features wrap front design and knee-length cut. Timeless elegance in signature red.',
        categoryId: dressesCategory.id,
        dailyPrice: 2000,
        depositPrice: 6500,
        stock: 1,
        colors: ['Red'],
        sizes: ['XS', 'S'],
        material: 'Silk',
        condition: 'LIKE_NEW',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1595777707802-221ae2ef9b8d?w=600&h=800&fit=crop',
            alt: 'Valentino Red Silk Dress',
            order: 0,
          },
        ],
      },
      {
        title: 'Dior Champagne Gown',
        slug: 'dior-champagne-gown',
        description: 'Exquisite Dior couture gown in champagne silk. Features intricate crystal embellishments and floor-length train. Perfect for weddings and galas.',
        categoryId: eveningWearCategory.id,
        dailyPrice: 3000,
        depositPrice: 10000,
        stock: 1,
        colors: ['Champagne'],
        sizes: ['S', 'M'],
        material: 'Silk with Crystal Beads',
        condition: 'NEW',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1558168508-e0db3814a69e?w=600&h=800&fit=crop',
            alt: 'Dior Champagne Gown',
            order: 0,
          },
        ],
      },
      {
        title: 'Burberry Trench Coat',
        slug: 'burberry-trench-coat',
        description: 'Classic heritage trench coat in iconic beige with signature check pattern. Timeless investment piece for any wardrobe. Adjustable waist belt.',
        categoryId: blazersCategory.id,
        dailyPrice: 800,
        depositPrice: 2500,
        stock: 4,
        colors: ['Beige', 'Black'],
        sizes: ['XS', 'S', 'M', 'L'],
        material: 'Premium Cotton Gabardine',
        condition: 'GOOD',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1539533057440-7a07fb3b312d?w=600&h=800&fit=crop',
            alt: 'Burberry Trench Coat',
            order: 0,
          },
        ],
      },
      {
        title: 'Gucci Power Blazer',
        slug: 'gucci-power-blazer',
        description: 'Contemporary Gucci blazer with sharp tailoring. Features signature GG pattern and structured shoulders. Perfect for professional and evening wear.',
        categoryId: blazersCategory.id,
        dailyPrice: 1200,
        depositPrice: 4000,
        stock: 3,
        colors: ['Black', 'Navy'],
        sizes: ['XS', 'S', 'M', 'L'],
        material: 'Wool',
        condition: 'LIKE_NEW',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=800&fit=crop',
            alt: 'Gucci Power Blazer',
            order: 0,
          },
        ],
      },
      {
        title: 'Hermès Birkin Style Handbag',
        slug: 'hermes-birkin-handbag',
        description: 'Luxury handbag with iconic silhouette. Crafted from premium leather with gold hardware. Includes dust bag. Perfect for any occasion.',
        categoryId: accessoriesCategory.id,
        dailyPrice: 1500,
        depositPrice: 5000,
        stock: 2,
        colors: ['Burgundy', 'Black'],
        sizes: ['One Size'],
        material: 'Leather',
        condition: 'LIKE_NEW',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop',
            alt: 'Hermès Birkin Handbag',
            order: 0,
          },
        ],
      },
      {
        title: 'Louis Vuitton Clutch',
        slug: 'louis-vuitton-clutch',
        description: 'Elegant Louis Vuitton clutch with signature monogram. Perfect for evening events. Detachable wrist strap for versatility.',
        categoryId: accessoriesCategory.id,
        dailyPrice: 600,
        depositPrice: 2000,
        stock: 3,
        colors: ['Gold', 'Silver'],
        sizes: ['One Size'],
        material: 'Canvas with Leather Trim',
        condition: 'LIKE_NEW',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop',
            alt: 'Louis Vuitton Clutch',
            order: 0,
          },
        ],
      },
      {
        title: 'Prada Statement Necklace',
        slug: 'prada-statement-necklace',
        description: 'Bold Prada statement necklace with oversized crystals. Perfect for adding glamour to any outfit. Adjustable length.',
        categoryId: accessoriesCategory.id,
        dailyPrice: 300,
        depositPrice: 1000,
        stock: 5,
        colors: ['Silver'],
        sizes: ['One Size'],
        material: 'Crystal & Metal',
        condition: 'NEW',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=800&fit=crop',
            alt: 'Prada Statement Necklace',
            order: 0,
          },
        ],
      },
    ].map((p) =>
      prisma.product.create({
        data: {
          ...p,
          status: 'PUBLISHED',
          images: {
            create: p.images,
          },
        },
        include: {
          images: true,
        },
      }),
    ),
  );

  // Create sample order for analytics
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const sampleOrder = await prisma.order.create({
    data: {
      userId: customer1.id,
      subtotal: 2500,
      tax: 200,
      deposit: 8000,
      total: 10700,
      status: 'CONFIRMED',
      paymentIntentId: 'pi_demo_12345',
      items: {
        create: {
          productId: products[0].id,
          rentalFromDate: tomorrow,
          rentalToDate: dayAfter,
          quantity: 1,
          price: 2500,
        },
      },
    },
  });

  const payment = await prisma.payment.create({
    data: {
      orderId: sampleOrder.id,
      userId: customer1.id,
      paymentIntentId: 'pi_demo_12345',
      amount: 10700,
      currency: 'THB',
      status: 'SUCCEEDED',
      metadata: {
        orderDate: new Date().toISOString(),
        rentals: '1 item',
      },
    },
  });

  console.log(`✅ Seeded ${products.length} luxury products`);
  console.log(`✅ Created admin: ${admin.email}`);
  console.log(`✅ Created test customers: ${customer1.email}, ${customer2.email}`);
  console.log(`✅ Created sample order and payment`);
  console.log(`✅ Created categories: ${eveningWearCategory.name}, ${dressesCategory.name}, ${blazersCategory.name}, ${accessoriesCategory.name}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✅ Milin Shop database seeded successfully!');
    console.log('\nDEMO CREDENTIALS:');
    console.log('Admin: admin@milinshop.com / Admin@123456');
    console.log('Customer 1: sarah@example.com / Customer@123456');
    console.log('Customer 2: emma@example.com / Customer@123456');
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
