const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Painting Services in Neon Database...');

  // 1. Find or create Painting Category
  let paintingCat = await prisma.serviceCategory.findUnique({
    where: { slug: 'painting' },
  });

  if (!paintingCat) {
    paintingCat = await prisma.serviceCategory.create({
      data: {
        name: 'Painting',
        slug: 'painting',
        description: 'Interior and exterior painting services',
        iconName: 'paintbrush',
      },
    });
    console.log('Created Painting category:', paintingCat.id);
  } else {
    console.log('Found existing Painting category:', paintingCat.id);
  }

  // 2. Define Painting Services
  const paintingServices = [
    {
      name: 'Interior Wall Painting',
      slug: 'interior-painting',
      description: 'Full home interior wall painting, primer, 2-coat paint & smooth finish',
      basePrice: 1999,
      categoryId: paintingCat.id,
    },
    {
      name: 'Exterior Weatherproof Painting',
      slug: 'exterior-painting',
      description: 'Durable weather-resistant exterior wall painting and surface protection',
      basePrice: 2999,
      categoryId: paintingCat.id,
    },
    {
      name: 'Designer Wall & Texture Painting',
      slug: 'wall-texture-painting',
      description: 'Designer accent wall textures, stencil patterns, and premium luxury finish',
      basePrice: 1499,
      categoryId: paintingCat.id,
    },
    {
      name: 'Waterproofing & Damp Treatment',
      slug: 'waterproofing-treatment',
      description: 'Wall seepage repair, anti-damp treatment, and leak prevention coating',
      basePrice: 899,
      categoryId: paintingCat.id,
    },
    {
      name: 'Patch Repair & Spot Touch-up',
      slug: 'wall-touchup-painting',
      description: 'Nail hole filling, drywall plaster patch repair, and spot color matching',
      basePrice: 499,
      categoryId: paintingCat.id,
    },
  ];

  const createdServices = [];
  for (const s of paintingServices) {
    const svc = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        description: s.description,
        basePrice: s.basePrice,
        categoryId: s.categoryId,
      },
      create: s,
    });
    createdServices.push(svc);
    console.log(`  ✓ ${svc.name} (₹${svc.basePrice})`);
  }

  // 3. Link Painting services to technicians so matching works
  const techProfiles = await prisma.technicianProfile.findMany();
  for (const tech of techProfiles) {
    for (const svc of createdServices) {
      await prisma.technicianService.upsert({
        where: {
          technicianId_serviceId: {
            technicianId: tech.id,
            serviceId: svc.id,
          },
        },
        update: {},
        create: {
          technicianId: tech.id,
          serviceId: svc.id,
        },
      });
    }
  }
  console.log(`Linked ${createdServices.length} painting services to ${techProfiles.length} technicians.`);

  console.log('✅ Painting services seeded and linked successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
