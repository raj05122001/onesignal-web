// prisma/seed.js
// Seeds the database with one Admin user, one Sender user,
// a default “All Subscribers” group, and a sample subscriber.
//
// Run with:  npx prisma db seed
// (make sure DATABASE_URL is set in your .env)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  /* ───────────────
     1. Seed Users
  ─────────────── */
  const adminPassword  = await bcrypt.hash('Admin@123', 10);
  const senderPassword = await bcrypt.hash('Sender@123', 10);

  const admin  = await prisma.user.upsert({
    where:  { email: 'admin@example.com' },
    update: {},
    create: {
      email:    'admin@example.com',
      password: adminPassword,
      role:     'ADMIN',
    },
  });

  const sender = await prisma.user.upsert({
    where:  { email: 'sender@example.com' },
    update: {},
    create: {
      email:    'sender@example.com',
      password: senderPassword,
      role:     'SENDER',
    },
  });

  /* ───────────────
     2. Seed Group
  ─────────────── */
  const allSubsGroup = await prisma.group.upsert({
    where:  { name: 'All Subscribers' },
    update: {},
    create: {
      name:        'All Subscribers',
      description: 'Default group containing every subscriber',
    },
  });

  /* ───────────────
     3. Seed Subscriber
  ─────────────── */
  const subscriber = await prisma.subscriber.upsert({
    where:  { playerId: 'sample-player-id' },
    update: {},
    create: {
      playerId: 'sample-player-id',
      mobile:   '+911234567890',
      groups:   { connect: { id: allSubsGroup.id } },
    },
  });

  console.log('🌱  Seed complete:', {
    admin:  admin.email,
    sender: sender.email,
    group:  allSubsGroup.name,
    sampleSubscriber: subscriber.playerId,
  });
}

/* ───────────────
   Execute
─────────────── */
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
