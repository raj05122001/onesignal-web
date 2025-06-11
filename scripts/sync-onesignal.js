// scripts/sync-onesignal.js
// Quick script to sync OneSignal data manually

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

async function syncOneSignalData() {
  console.log('🚀 Starting OneSignal data sync...\n');

  try {
    // 1. Fetch OneSignal subscribers
    console.log('📥 Fetching OneSignal subscribers...');
    
    const response = await fetch(
      `https://api.onesignal.com/players?app_id=${ONESIGNAL_APP_ID}&limit=300`,
      {
        headers: {
          'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`OneSignal API error: ${response.status}`);
    }

    const data = await response.json();
    const players = data.players || [];
    
    console.log(`✅ Found ${players.length} OneSignal players`);

    // 2. Filter subscribed players
    const subscribedPlayers = players.filter(player => 
      player.notification_types > 0 && 
      player.invalid_identifier !== true
    );

    console.log(`🔔 Subscribed players: ${subscribedPlayers.length}`);

    // 3. Get/Create default group
    let defaultGroup = await prisma.group.findFirst({
      where: { name: 'All Subscribers' }
    });

    if (!defaultGroup) {
      console.log('📁 Creating default group...');
      defaultGroup = await prisma.group.create({
        data: {
          name: 'All Subscribers',
          description: 'Default group for all subscribers'
        }
      });
    }

    // 4. Sync subscribers
    let created = 0;
    let updated = 0;

    for (const player of subscribedPlayers) {
      try {
        // Check if exists
        const existing = await prisma.subscriber.findFirst({
          where: { playerId: player.id }
        });

        if (existing) {
          // Update existing
          await prisma.subscriber.update({
            where: { id: existing.id },
            data: { updatedAt: new Date() }
          });
          updated++;
          console.log(`🔄 Updated: ${player.id}`);
        } else {
          // Create new
          await prisma.subscriber.create({
            data: {
              playerId: player.id,
              mobile: null, // Will be filled when user provides
              groups: {
                connect: { id: defaultGroup.id }
              }
            }
          });
          created++;
          console.log(`➕ Created: ${player.id}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${player.id}:`, error.message);
      }
    }

    // 5. Final counts
    const totalLocal = await prisma.subscriber.count();
    
    console.log('\n✅ Sync completed!');
    console.log(`📊 Results:`);
    console.log(`   • Created: ${created}`);
    console.log(`   • Updated: ${updated}`);
    console.log(`   • Total local subscribers: ${totalLocal}`);
    console.log(`   • OneSignal subscribers: ${subscribedPlayers.length}`);

  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncOneSignalData();

