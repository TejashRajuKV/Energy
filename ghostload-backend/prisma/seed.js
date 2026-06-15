/**
 * GhostLoad — Database Seed
 * Seeds a demo organization, site, bill, schedule, equipment, and analysis
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding GhostLoad database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('Password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@ghostload.app' },
    update: {},
    create: {
      name: 'Priya Demo',
      email: 'demo@ghostload.app',
      passwordHash,
      authProvider: 'email',
      emailVerifiedAt: new Date(),
      preferredCurrency: 'INR',
      timezone: 'Asia/Kolkata',
    },
  });
  console.log('✅ Created user:', user.email);

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-org-ghostload' },
    update: {},
    create: {
      name: 'Demo Office Pvt Ltd',
      slug: 'demo-org-ghostload',
      industry: 'Technology',
      companySize: '51-200',
      createdBy: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'owner',
          joinedAt: new Date(),
        },
      },
    },
  });
  console.log('✅ Created org:', org.name);

  // Create demo site
  const site = await prisma.site.create({
    data: {
      organizationId: org.id,
      name: 'Bengaluru HQ',
      siteType: 'office',
      city: 'Bengaluru',
      country: 'India',
      timezone: 'Asia/Kolkata',
      floorAreaSqft: 8000,
      occupantsMin: 40,
      occupantsMax: 60,
      hvacType: 'split_ac',
      hasServerRoom: true,
      weekendUsage: 'low',
    },
  });
  console.log('✅ Created site:', site.name);

  // Create schedule
  await prisma.siteSchedule.create({
    data: {
      siteId: site.id,
      weekdayOpenTime: '09:00',
      weekdayCloseTime: '19:00',
      saturdayOpenTime: '10:00',
      saturdayCloseTime: '15:00',
      securityAlwaysOn: true,
      hvacPrecoolMins: 30,
      hvacPostcoolMins: 30,
    },
  });
  console.log('✅ Created schedule');

  // Create utility bill
  const bill = await prisma.utilityBill.create({
    data: {
      siteId: site.id,
      billingPeriodStart: new Date('2026-05-01'),
      billingPeriodEnd: new Date('2026-05-31'),
      billAmount: 145000,
      currency: 'INR',
      kwhTotal: 17059,
      tariffType: 'flat',
      unitRate: 8.5,
      sourceType: 'manual',
    },
  });
  console.log('✅ Created utility bill: ₹', bill.billAmount.toString());

  // Create equipment
  const equipmentItems = [
    { category: 'hvac',     itemName: 'Split AC 1.5 Ton', quantity: 12, ratedWatts: 1500, standbyWatts: 5,  usagePattern: 'scheduled' },
    { category: 'compute',  itemName: 'Desktop PC',       quantity: 50, ratedWatts: 150,  standbyWatts: 5,  usagePattern: 'scheduled' },
    { category: 'compute',  itemName: 'Monitor 24"',      quantity: 50, ratedWatts: 30,   standbyWatts: 2,  usagePattern: 'scheduled' },
    { category: 'compute',  itemName: 'Laser Printer',    quantity: 4,  ratedWatts: 400,  standbyWatts: 8,  usagePattern: 'intermittent' },
    { category: 'network',  itemName: 'Network Switch',   quantity: 6,  ratedWatts: 30,   standbyWatts: 30, usagePattern: 'always_on' },
    { category: 'network',  itemName: 'Server Rack',      quantity: 2,  ratedWatts: 500,  standbyWatts: 500,usagePattern: 'always_on' },
    { category: 'kitchen',  itemName: 'Refrigerator',     quantity: 2,  ratedWatts: 200,  standbyWatts: 200,usagePattern: 'always_on' },
    { category: 'kitchen',  itemName: 'Coffee Machine',   quantity: 2,  ratedWatts: 1200, standbyWatts: 5,  usagePattern: 'scheduled' },
    { category: 'lighting', itemName: 'LED Tube 18W',     quantity: 80, ratedWatts: 18,   standbyWatts: 0,  usagePattern: 'scheduled' },
  ];

  await prisma.equipmentProfile.createMany({
    data: equipmentItems.map((e) => ({ siteId: site.id, ...e })),
  });
  console.log('✅ Created', equipmentItems.length, 'equipment items');

  console.log('\n🎉 Seed complete!');
  console.log('   Login: demo@ghostload.app / Password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
