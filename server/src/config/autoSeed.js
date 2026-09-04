const bcrypt = require('bcryptjs');
const prisma = require('./database');
const logger = require('./logger');

const SALT_ROUNDS = 12;

/**
 * Ensure baseline seed data (Admin, Technician, Customer demo users, categories, services)
 * exists in the database. Safe to run repeatedly (uses upserts / findOrCreate).
 */
async function autoSeed() {
  try {
    const hash = await bcrypt.hash('Password123!', SALT_ROUNDS);

    // 1. Ensure Admin User
    const admin = await prisma.user.upsert({
      where: { email: 'admin@fixit.com' },
      update: {
        passwordHash: hash,
        isActive: true,
        emailVerified: true,
        role: 'ADMIN',
      },
      create: {
        email: 'admin@fixit.com',
        passwordHash: hash,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        emailVerified: true,
        phone: '+91-9000000000',
      },
    });

    // 2. Ensure Customer User
    const customer = await prisma.user.upsert({
      where: { email: 'customer@fixit.com' },
      update: {
        passwordHash: hash,
        isActive: true,
        emailVerified: true,
      },
      create: {
        email: 'customer@fixit.com',
        passwordHash: hash,
        firstName: 'Rahul',
        lastName: 'Sharma',
        role: 'CUSTOMER',
        emailVerified: true,
        phone: '+91-9876543210',
      },
    });

    // 3. Ensure Technician User & Profile
    const tech = await prisma.user.upsert({
      where: { email: 'tech@fixit.com' },
      update: {
        passwordHash: hash,
        isActive: true,
        emailVerified: true,
      },
      create: {
        email: 'tech@fixit.com',
        passwordHash: hash,
        firstName: 'Vikram',
        lastName: 'Singh',
        role: 'TECHNICIAN',
        emailVerified: true,
        phone: '+91-9111111111',
      },
    });

    await prisma.technicianProfile.upsert({
      where: { userId: tech.id },
      update: {
        availability: 'ONLINE',
        verificationStatus: 'APPROVED',
      },
      create: {
        userId: tech.id,
        bio: 'Certified master technician with 8+ years experience.',
        experienceYears: 8,
        verificationStatus: 'APPROVED',
        availability: 'ONLINE',
        averageRating: 4.9,
        totalReviews: 28,
        totalJobsCompleted: 142,
        totalEarnings: 84500,
      },
    });

    // 4. Ensure Categories
    const categoriesData = [
      { name: 'Electronics', slug: 'electronics', description: 'Laptop, phone, TV, and computer repairs', iconName: 'monitor' },
      { name: 'HVAC', slug: 'hvac', description: 'Air conditioning, heating, and ventilation', iconName: 'thermometer' },
      { name: 'Plumbing', slug: 'plumbing', description: 'Pipes, fixtures, drainage, and water systems', iconName: 'droplets' },
      { name: 'Electrical', slug: 'electrical', description: 'Wiring, outlets, lighting, and panel work', iconName: 'zap' },
      { name: 'Appliances', slug: 'appliances', description: 'Washing machine, refrigerator, oven repairs', iconName: 'refrigerator' },
      { name: 'Painting', slug: 'painting', description: 'Interior and exterior painting services', iconName: 'paintbrush' },
    ];

    for (const cat of categoriesData) {
      const category = await prisma.serviceCategory.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });

      // Sample services per category
      if (cat.slug === 'electronics') {
        await prisma.service.upsert({
          where: { slug: 'laptop-repair' },
          update: {},
          create: {
            categoryId: category.id,
            name: 'Laptop Repair',
            slug: 'laptop-repair',
            description: 'Screen replacement, keyboard, motherboard fixes',
            basePrice: 500,
          },
        });
        await prisma.service.upsert({
          where: { slug: 'phone-screen-repair' },
          update: {},
          create: {
            categoryId: category.id,
            name: 'Phone Screen Repair',
            slug: 'phone-screen-repair',
            description: 'Phone screen and display replacement',
            basePrice: 800,
          },
        });
      } else if (cat.slug === 'hvac') {
        await prisma.service.upsert({
          where: { slug: 'ac-repair' },
          update: {},
          create: {
            categoryId: category.id,
            name: 'AC Repair',
            slug: 'ac-repair',
            description: 'Split and window AC servicing and repair',
            basePrice: 400,
          },
        });
      } else if (cat.slug === 'plumbing') {
        await prisma.service.upsert({
          where: { slug: 'pipe-leak-repair' },
          update: {},
          create: {
            categoryId: category.id,
            name: 'Pipe Leak Repair',
            slug: 'pipe-leak-repair',
            description: 'Emergency pipe burst and leakage repair',
            basePrice: 350,
          },
        });
      }
    }

    logger.info('✓ Default seed data verified / auto-seeded successfully');
  } catch (error) {
    logger.warn('AutoSeed check failed (tables may need migration):', { error: error.message });
  }
}

module.exports = { autoSeed };
