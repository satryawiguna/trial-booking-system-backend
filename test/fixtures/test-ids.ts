/**
 * Test fixture IDs — mirrors seed data in libs/database/prisma/seed.ts.
 * Use these constants instead of hardcoding UUIDs in tests.
 */

export const TEST_IDS = {
  students: {
    emma: '10000000-0000-0000-0000-000000000001',
    sophia: '10000000-0000-0000-0000-000000000002',
    ava: '10000000-0000-0000-0000-000000000003',
    noah: '10000000-0000-0000-0000-000000000004',
    liam: '10000000-0000-0000-0000-000000000005',
    mason: '10000000-0000-0000-0000-000000000006',
  },
  trialClasses: {
    mathFundamentals: '20000000-0000-0000-0000-000000000001', // 0/4 available
    scienceExplorer: '20000000-0000-0000-0000-000000000002', // 3/4 nearly full
    codingBasics: '20000000-0000-0000-0000-000000000003', // 4/4 FULL
    englishLiterature: '20000000-0000-0000-0000-000000000004', // 0/4, pending+failed
  },
  bookings: {
    sciEmma: '50000000-0000-0000-0000-000000000001', // Confirmed, Science Explorer
    sciSophia: '50000000-0000-0000-0000-000000000002', // Confirmed
    sciAva: '50000000-0000-0000-0000-000000000003', // Confirmed
    engPending: '50000000-0000-0000-0000-000000000009', // PendingPayment, English Lit
    engFailed: '50000000-0000-0000-0000-000000000010', // PaymentFailed, English Lit
  },
} as const;
