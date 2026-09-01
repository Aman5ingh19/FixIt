const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding Neon PostgreSQL database...');

  // Clean existing data
  await prisma.$transaction([
    prisma.activityLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.review.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.requestAssignment.deleteMany(),
    prisma.requestImage.deleteMany(),
    prisma.serviceLocation.deleteMany(),
    prisma.message.deleteMany(),
    prisma.serviceRequest.deleteMany(),
    prisma.technicianService.deleteMany(),
    prisma.serviceArea.deleteMany(),
    prisma.technicianProfile.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.service.deleteMany(),
    prisma.serviceCategory.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const hash = await bcrypt.hash('Password123!', 12);

  // ── Users ──
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fixit.com',
      passwordHash: hash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
      phone: '+91-9000000000',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@fixit.com',
      passwordHash: hash,
      firstName: 'Rahul',
      lastName: 'Sharma',
      role: 'CUSTOMER',
      emailVerified: true,
      phone: '+91-9876543210',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'priya@fixit.com',
      passwordHash: hash,
      firstName: 'Priya',
      lastName: 'Patel',
      role: 'CUSTOMER',
      emailVerified: true,
      phone: '+91-9876543211',
    },
  });

  const tech1 = await prisma.user.create({
    data: {
      email: 'tech@fixit.com',
      passwordHash: hash,
      firstName: 'Vikram',
      lastName: 'Singh',
      role: 'TECHNICIAN',
      emailVerified: true,
      phone: '+91-9111111111',
    },
  });

  const tech2 = await prisma.user.create({
    data: {
      email: 'arjun@fixit.com',
      passwordHash: hash,
      firstName: 'Arjun',
      lastName: 'Kumar',
      role: 'TECHNICIAN',
      emailVerified: true,
      phone: '+91-9222222222',
    },
  });

  console.log('  ✓ Users created');

  // ── Service Categories ──
  const categories = await Promise.all([
    prisma.serviceCategory.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Laptop, phone, TV, and computer repairs',
        iconName: 'monitor',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'HVAC',
        slug: 'hvac',
        description: 'Air conditioning, heating, and ventilation',
        iconName: 'thermometer',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Plumbing',
        slug: 'plumbing',
        description: 'Pipes, fixtures, drainage, and water systems',
        iconName: 'droplets',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Electrical',
        slug: 'electrical',
        description: 'Wiring, outlets, lighting, and panel work',
        iconName: 'zap',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Appliances',
        slug: 'appliances',
        description: 'Washing machine, refrigerator, oven repairs',
        iconName: 'refrigerator',
      },
    }),
    prisma.serviceCategory.create({
      data: {
        name: 'Painting',
        slug: 'painting',
        description: 'Interior and exterior painting services',
        iconName: 'paintbrush',
      },
    }),
  ]);

  console.log('  ✓ Service categories created');

  // ── Services ──
  const services = await Promise.all([
    // Electronics
    prisma.service.create({
      data: {
        name: 'Laptop Repair',
        slug: 'laptop-repair',
        description: 'Screen replacement, keyboard, hardware fixes',
        basePrice: 500,
        categoryId: categories[0].id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Phone Screen Repair',
        slug: 'phone-screen-repair',
        description: 'Phone screen and display replacement',
        basePrice: 800,
        categoryId: categories[0].id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'TV Repair',
        slug: 'tv-repair',
        description: 'LED, LCD, Smart TV diagnostics and repair',
        basePrice: 600,
        categoryId: categories[0].id,
      },
    }),
    // HVAC
    prisma.service.create({
      data: {
        name: 'AC Repair',
        slug: 'ac-repair',
        description: 'Split and window AC servicing and repair',
        basePrice: 400,
        categoryId: categories[1].id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'AC Installation',
        slug: 'ac-installation',
        description: 'New AC unit installation and setup',
        basePrice: 1500,
        categoryId: categories[1].id,
      },
    }),
    // Plumbing
    prisma.service.create({
      data: {
        name: 'Pipe Leak Repair',
        slug: 'pipe-leak-repair',
        description: 'Fix leaky pipes and faucets',
        basePrice: 300,
        categoryId: categories[2].id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Drain Cleaning',
        slug: 'drain-cleaning',
        description: 'Unclog drains and sewer lines',
        basePrice: 250,
        categoryId: categories[2].id,
      },
    }),
    // Electrical
    prisma.service.create({
      data: {
        name: 'Wiring Repair',
        slug: 'wiring-repair',
        description: 'Fix faulty wiring and short circuits',
        basePrice: 350,
        categoryId: categories[3].id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Fan Installation',
        slug: 'fan-installation',
        description: 'Ceiling and exhaust fan installation',
        basePrice: 200,
        categoryId: categories[3].id,
      },
    }),
    // Appliances
    prisma.service.create({
      data: {
        name: 'Washing Machine Repair',
        slug: 'washing-machine-repair',
        description: 'All brands washing machine repair',
        basePrice: 450,
        categoryId: categories[4].id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Refrigerator Repair',
        slug: 'refrigerator-repair',
        description: 'Cooling issues, compressor, thermostat repair',
        basePrice: 500,
        categoryId: categories[4].id,
      },
    }),
  ]);

  console.log('  ✓ Services created');

  // ── Technician Profiles ──
  const techProfile1 = await prisma.technicianProfile.create({
    data: {
      userId: tech1.id,
      bio: 'Experienced electronics and HVAC technician with 8+ years in the field.',
      experienceYears: 8,
      verificationStatus: 'APPROVED',
      availability: 'ONLINE',
      averageRating: 4.7,
      totalReviews: 23,
      totalJobsCompleted: 156,
      totalEarnings: 234500,
      technicianServices: {
        create: [
          { serviceId: services[0].id },
          { serviceId: services[2].id },
          { serviceId: services[3].id },
          { serviceId: services[4].id },
        ],
      },
      serviceAreas: {
        create: [
          { city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' },
          { city: 'Thane', state: 'Maharashtra', zipCode: '400601' },
        ],
      },
    },
  });

  const techProfile2 = await prisma.technicianProfile.create({
    data: {
      userId: tech2.id,
      bio: 'Plumbing and electrical specialist, certified and insured.',
      experienceYears: 5,
      verificationStatus: 'APPROVED',
      availability: 'ONLINE',
      averageRating: 4.5,
      totalReviews: 12,
      totalJobsCompleted: 89,
      totalEarnings: 133500,
      technicianServices: {
        create: [
          { serviceId: services[5].id },
          { serviceId: services[6].id },
          { serviceId: services[7].id },
          { serviceId: services[8].id },
        ],
      },
      serviceAreas: {
        create: [
          { city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' },
          { city: 'Navi Mumbai', state: 'Maharashtra', zipCode: '400703' },
        ],
      },
    },
  });

  console.log('  ✓ Technician profiles created');

  // ── Sample Requests ──
  const req1 = await prisma.serviceRequest.create({
    data: {
      customerId: customer1.id,
      serviceId: services[3].id,
      title: 'AC not cooling properly',
      description: 'My split AC is running but not cooling. The outdoor unit makes a loud noise when starting.',
      status: 'IN_PROGRESS',
      priority: 1,
      location: {
        create: {
          address: '42, Andheri West',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400058',
          country: 'India',
        },
      },
    },
  });

  await prisma.requestAssignment.create({
    data: { requestId: req1.id, technicianId: techProfile1.id, status: 'ACCEPTED' },
  });

  const req2 = await prisma.serviceRequest.create({
    data: {
      customerId: customer2.id,
      serviceId: services[5].id,
      title: 'Kitchen sink pipe leaking',
      description: 'Water is leaking from the pipe under my kitchen sink.',
      status: 'PENDING',
      priority: 2,
      location: {
        create: {
          address: '15, Bandra East',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400051',
          country: 'India',
        },
      },
    },
  });

  const req3 = await prisma.serviceRequest.create({
    data: {
      customerId: customer1.id,
      serviceId: services[0].id,
      title: 'Laptop screen flickering',
      description: 'My laptop screen flickers intermittently when on battery power.',
      status: 'COMPLETED',
      priority: 0,
      completedAt: new Date('2025-01-15'),
      location: {
        create: {
          address: '42, Andheri West',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400058',
          country: 'India',
        },
      },
    },
  });

  await prisma.requestAssignment.create({
    data: { requestId: req3.id, technicianId: techProfile1.id, status: 'ACCEPTED' },
  });

  console.log('  ✓ Sample requests created');

  // ── Sample Review ──
  await prisma.review.create({
    data: {
      requestId: req3.id,
      authorId: customer1.id,
      subjectId: tech1.id,
      rating: 5,
      comment: 'Vikram was incredibly professional and fixed my laptop screen in under an hour. Highly recommended!',
    },
  });

  console.log('  ✓ Reviews created');

  // ── Sample Payments (Status Tracking) ──
  await prisma.payment.createMany({
    data: [
      {
        requestId: req1.id,
        amount: 400,
        status: 'PENDING',
        method: 'STATUS_TRACKING',
        transactionId: 'TXN_DEV_PENDING_001',
      },
      {
        requestId: req3.id,
        amount: 500,
        status: 'PAID',
        method: 'STATUS_TRACKING',
        transactionId: 'TXN_DEV_PAID_002',
      },
    ],
  });

  console.log('  ✓ Sample payments created');

  // ── Notifications ──
  await prisma.notification.createMany({
    data: [
      {
        userId: customer1.id,
        type: 'REQUEST_IN_PROGRESS',
        title: 'Service started',
        body: 'Vikram has started working on your AC repair request.',
        data: { requestId: req1.id },
      },
      {
        userId: tech1.id,
        type: 'REQUEST_ASSIGNED',
        title: 'New request available',
        body: 'A new AC repair request is available in Mumbai.',
        data: { requestId: req1.id },
      },
      {
        userId: tech1.id,
        type: 'REVIEW_RECEIVED',
        title: 'New 5-star review!',
        body: 'Rahul Sharma gave you a 5-star review.',
        data: { rating: 5 },
      },
      {
        userId: admin.id,
        type: 'SYSTEM',
        title: 'System update',
        body: 'Platform v2.0 connected to Neon PostgreSQL successfully.',
        data: {},
      },
    ],
  });

  console.log('  ✓ Notifications created');
  console.log('');
  console.log('✅ Neon Database Seed Complete!');
  console.log('');
  console.log('Demo accounts (password: Password123!):');
  console.log('  Admin:      admin@fixit.com');
  console.log('  Customer:   customer@fixit.com');
  console.log('  Technician: tech@fixit.com');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
