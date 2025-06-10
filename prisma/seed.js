// prisma/seed.js
// Seed data for userdb database

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding userdb database...\n');

  try {
    // Create default "All Subscribers" group
    console.log('Creating default groups...');
    const defaultGroup = await prisma.group.upsert({
      where: { name: 'All Subscribers' },
      update: {},
      create: {
        name: 'All Subscribers',
        description: 'Default group containing every subscriber',
      },
    });
    console.log(`✅ Created group: ${defaultGroup.name}`);

    // Create VIP group
    const vipGroup = await prisma.group.upsert({
      where: { name: 'VIP Users' },
      update: {},
      create: {
        name: 'VIP Users',
        description: 'High-value subscribers with premium features',
      },
    });
    console.log(`✅ Created group: ${vipGroup.name}`);

    // Create admin user
    console.log('\nCreating admin user...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: hashedAdminPassword,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Created admin: ${adminUser.email}`);

    // Create sender user
    const hashedSenderPassword = await bcrypt.hash('sender123', 12);
    const senderUser = await prisma.user.upsert({
      where: { email: 'sender@example.com' },
      update: {},
      create: {
        email: 'sender@example.com',
        password: hashedSenderPassword,
        role: 'SENDER',
      },
    });
    console.log(`✅ Created sender: ${senderUser.email}`);

    // Create some sample subscribers
    console.log('\nCreating sample subscribers...');
    
    const subscriber1 = await prisma.subscriber.upsert({
      where: { playerId: 'sample-player-1' },
      update: {},
      create: {
        playerId: 'sample-player-1',
        mobile: '+1234567890',
        groups: {
          connect: [
            { id: defaultGroup.id },
            { id: vipGroup.id }
          ]
        }
      },
    });
    console.log(`✅ Created subscriber: ${subscriber1.mobile}`);

    const subscriber2 = await prisma.subscriber.upsert({
      where: { playerId: 'sample-player-2' },
      update: {},
      create: {
        playerId: 'sample-player-2',
        mobile: '+1987654321',
        groups: {
          connect: [{ id: defaultGroup.id }]
        }
      },
    });
    console.log(`✅ Created subscriber: ${subscriber2.mobile}`);

    const subscriber3 = await prisma.subscriber.upsert({
      where: { playerId: 'sample-player-3' },
      update: {},
      create: {
        playerId: 'sample-player-3',
        mobile: '+1122334455',
        groups: {
          connect: [{ id: vipGroup.id }]
        }
      },
    });
    console.log(`✅ Created subscriber: ${subscriber3.mobile}`);

    // Final counts
    const finalUserCount = await prisma.user.count();
    const finalSubscriberCount = await prisma.subscriber.count();
    const finalGroupCount = await prisma.group.count();

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`📊 Final counts:`);
    console.log(`   Users: ${finalUserCount}`);
    console.log(`   Subscribers: ${finalSubscriberCount}`);
    console.log(`   Groups: ${finalGroupCount}`);
    
    console.log('\n🔑 Login credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   Sender: sender@example.com / sender123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });