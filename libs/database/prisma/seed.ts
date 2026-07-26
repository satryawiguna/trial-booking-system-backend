import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ---------------------------------------------------------------------------
  // Parents
  // ---------------------------------------------------------------------------
  const parent1 = await prisma.parent.upsert({
    where: { id: '40000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '40000000-0000-0000-0000-000000000001',
      name: 'Michael Johnson',
      email: 'michael.johnson@example.com',
    },
  });

  const parent2 = await prisma.parent.upsert({
    where: { id: '40000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '40000000-0000-0000-0000-000000000002',
      name: 'Sarah Smith',
      email: 'sarah.smith@example.com',
    },
  });

  const parent3 = await prisma.parent.upsert({
    where: { id: '40000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '40000000-0000-0000-0000-000000000003',
      name: 'David Brown',
      email: 'david.brown@example.com',
    },
  });

  const parent4 = await prisma.parent.upsert({
    where: { id: '40000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '40000000-0000-0000-0000-000000000004',
      name: 'Lisa Williams',
      email: 'lisa.williams@example.com',
    },
  });

  // ---------------------------------------------------------------------------
  // Students
  // ---------------------------------------------------------------------------
  const student1 = await prisma.student.upsert({
    where: { id: '10000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '10000000-0000-0000-0000-000000000001',
      parentId: parent1.id,
      name: 'Emma Johnson',
      birthDate: new Date('2017-05-12'),
    },
  });

  const student2 = await prisma.student.upsert({
    where: { id: '10000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '10000000-0000-0000-0000-000000000002',
      parentId: parent2.id,
      name: 'Sophia Smith',
      birthDate: new Date('2016-09-23'),
    },
  });

  const student3 = await prisma.student.upsert({
    where: { id: '10000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '10000000-0000-0000-0000-000000000003',
      parentId: parent2.id,
      name: 'Ava Brown',
      birthDate: new Date('2018-01-15'),
    },
  });

  const student4 = await prisma.student.upsert({
    where: { id: '10000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '10000000-0000-0000-0000-000000000004',
      parentId: parent3.id,
      name: 'Noah Brown',
      birthDate: new Date('2017-11-08'),
    },
  });

  const student5 = await prisma.student.upsert({
    where: { id: '10000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '10000000-0000-0000-0000-000000000005',
      parentId: parent4.id,
      name: 'Liam Williams',
      birthDate: new Date('2016-03-30'),
    },
  });

  const student6 = await prisma.student.upsert({
    where: { id: '10000000-0000-0000-0000-000000000006' },
    update: {},
    create: {
      id: '10000000-0000-0000-0000-000000000006',
      parentId: parent4.id,
      name: 'Mason Williams',
      birthDate: new Date('2018-07-19'),
    },
  });

  // ---------------------------------------------------------------------------
  // Trial Classes
  // ---------------------------------------------------------------------------
  await prisma.trialClass.upsert({
    where: { id: '20000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '20000000-0000-0000-0000-000000000001',
      title: 'Math Fundamentals',
      capacity: 4,
      startTime: new Date('2026-08-01T09:00:00Z'),
    },
  });

  await prisma.trialClass.upsert({
    where: { id: '20000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '20000000-0000-0000-0000-000000000002',
      title: 'Science Explorer — Nearly Full (3/4)',
      capacity: 4,
      startTime: new Date('2026-08-02T10:00:00Z'),
    },
  });

  await prisma.trialClass.upsert({
    where: { id: '20000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '20000000-0000-0000-0000-000000000003',
      title: 'Coding Basics — Full (4/4)',
      capacity: 4,
      startTime: new Date('2026-08-03T11:00:00Z'),
    },
  });

  await prisma.trialClass.upsert({
    where: { id: '20000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '20000000-0000-0000-0000-000000000004',
      title: 'English Literature',
      capacity: 4,
      startTime: new Date('2026-08-04T08:00:00Z'),
    },
  });

  // ---------------------------------------------------------------------------
  // Bookings — Science Explorer (class 2): 3 confirmed + 1 cancelled
  // ---------------------------------------------------------------------------
  const bSci1 = await prisma.booking.upsert({
    where: { id: '50000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '50000000-0000-0000-0000-000000000001',
      studentId: student1.id,
      trialClassId: '20000000-0000-0000-0000-000000000002',
      status: 'CONFIRMED',
      confirmedAt: new Date('2026-07-20T10:00:00Z'),
    },
  });

  const bSci2 = await prisma.booking.upsert({
    where: { id: '50000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '50000000-0000-0000-0000-000000000002',
      studentId: student2.id,
      trialClassId: '20000000-0000-0000-0000-000000000002',
      status: 'CONFIRMED',
      confirmedAt: new Date('2026-07-21T11:00:00Z'),
    },
  });

  const bSci3 = await prisma.booking.upsert({
    where: { id: '50000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '50000000-0000-0000-0000-000000000003',
      studentId: student3.id,
      trialClassId: '20000000-0000-0000-0000-000000000002',
      status: 'CONFIRMED',
      confirmedAt: new Date('2026-07-22T09:00:00Z'),
    },
  });

  // Science Explorer — cancelled booking (student 6)
  await prisma.booking.upsert({
    where: { id: '50000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '50000000-0000-0000-0000-000000000004',
      studentId: student6.id,
      trialClassId: '20000000-0000-0000-0000-000000000002',
      status: 'CANCELLED',
    },
  });

  // ---------------------------------------------------------------------------
  // Bookings — Coding Basics (class 3): 4 confirmed (FULL)
  // ---------------------------------------------------------------------------
  await prisma.booking.upsert({
    where: { id: '50000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '50000000-0000-0000-0000-000000000005',
      studentId: student1.id,
      trialClassId: '20000000-0000-0000-0000-000000000003',
      status: 'CONFIRMED',
      confirmedAt: new Date('2026-07-18T08:00:00Z'),
    },
  });

  await prisma.booking.upsert({
    where: { id: '50000000-0000-0000-0000-000000000006' },
    update: {},
    create: {
      id: '50000000-0000-0000-0000-000000000006',
      studentId: student2.id,
      trialClassId: '20000000-0000-0000-0000-000000000003',
      status: 'CONFIRMED',
      confirmedAt: new Date('2026-07-19T08:00:00Z'),
    },
  });

  await prisma.booking.upsert({
    where: { id: '50000000-0000-0000-0000-000000000007' },
    update: {},
    create: {
      id: '50000000-0000-0000-0000-000000000007',
      studentId: student3.id,
      trialClassId: '20000000-0000-0000-0000-000000000003',
      status: 'CONFIRMED',
      confirmedAt: new Date('2026-07-19T09:00:00Z'),
    },
  });

  await prisma.booking.upsert({
    where: { id: '50000000-0000-0000-0000-000000000008' },
    update: {},
    create: {
      id: '50000000-0000-0000-0000-000000000008',
      studentId: student4.id,
      trialClassId: '20000000-0000-0000-0000-000000000003',
      status: 'CONFIRMED',
      confirmedAt: new Date('2026-07-20T10:00:00Z'),
    },
  });

  // ---------------------------------------------------------------------------
  // Bookings — English Literature (class 4): 1 pending + 1 payment failed
  // ---------------------------------------------------------------------------
  const bEngPending = await prisma.booking.upsert({
    where: { id: '50000000-0000-0000-0000-000000000009' },
    update: {},
    create: {
      id: '50000000-0000-0000-0000-000000000009',
      studentId: student5.id,
      trialClassId: '20000000-0000-0000-0000-000000000004',
      status: 'PENDING_PAYMENT',
    },
  });

  const bEngFailed = await prisma.booking.upsert({
    where: { id: '50000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '50000000-0000-0000-0000-000000000010',
      studentId: student6.id,
      trialClassId: '20000000-0000-0000-0000-000000000004',
      status: 'PAYMENT_FAILED',
    },
  });

  // ---------------------------------------------------------------------------
  // Payment Attempts — Science Explorer confirmed bookings
  // ---------------------------------------------------------------------------
  await prisma.paymentAttempt.upsert({
    where: { id: '60000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '60000000-0000-0000-0000-000000000001',
      bookingId: bSci1.id,
      status: 'SUCCESS',
      paidAt: new Date('2026-07-20T10:00:00Z'),
    },
  });

  await prisma.paymentAttempt.upsert({
    where: { id: '60000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '60000000-0000-0000-0000-000000000002',
      bookingId: bSci2.id,
      status: 'SUCCESS',
      paidAt: new Date('2026-07-21T11:00:00Z'),
    },
  });

  await prisma.paymentAttempt.upsert({
    where: { id: '60000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '60000000-0000-0000-0000-000000000003',
      bookingId: bSci3.id,
      status: 'SUCCESS',
      paidAt: new Date('2026-07-22T09:00:00Z'),
    },
  });

  // ---------------------------------------------------------------------------
  // Payment Attempts — Coding Basics (full class) confirmed bookings
  // ---------------------------------------------------------------------------
  for (let i = 0; i < 4; i++) {
    await prisma.paymentAttempt.upsert({
      where: { id: `60000000-0000-0000-0000-00000000000${4 + i}` },
      update: {},
      create: {
        id: `60000000-0000-0000-0000-00000000000${4 + i}`,
        bookingId: `50000000-0000-0000-0000-00000000000${5 + i}`,
        status: 'SUCCESS',
        paidAt: new Date('2026-07-18T08:00:00Z'),
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Payment Attempt — English Literature pending + failed
  // ---------------------------------------------------------------------------
  await prisma.paymentAttempt.upsert({
    where: { id: '60000000-0000-0000-0000-000000000008' },
    update: {},
    create: {
      id: '60000000-0000-0000-0000-000000000008',
      bookingId: bEngFailed.id,
      status: 'FAILED',
      paidAt: new Date('2026-07-23T14:00:00Z'),
    },
  });

  console.log('✅ Seed data loaded successfully');
  console.log('   - 4 parents');
  console.log('   - 6 students');
  console.log('   - 4 trial classes');
  console.log('   - 10 bookings');
  console.log('   - 8 payment attempts');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
