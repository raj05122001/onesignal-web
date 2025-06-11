// src/app/api/admin/sync-onesignal/route.js
// Fixed OneSignal Data Sync with Enhanced Error Handling

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireRole } from "@/lib/auth";

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
const ONESIGNAL_API_BASE = "https://api.onesignal.com";

export async function POST(request) {
  try {
    // Only ADMIN can sync data
    await requireRole(["ADMIN"]);

    console.log('🔄 Starting OneSignal sync...');
    console.log('App ID:', ONESIGNAL_APP_ID ? 'Set' : 'Missing');
    console.log('API Key:', ONESIGNAL_REST_API_KEY ? 'Set' : 'Missing');

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      return NextResponse.json(
        { 
          success: false,
          message: "OneSignal credentials not configured properly",
          debug: {
            appId: !!ONESIGNAL_APP_ID,
            apiKey: !!ONESIGNAL_REST_API_KEY
          }
        },
        { status: 500 }
      );
    }

    // Fetch all players from OneSignal with proper pagination
    let allPlayers = [];
    let offset = 0;
    const limit = 300;
    let totalFetched = 0;
    let hasMore = true;
    let apiCalls = 0;

    console.log('📥 Starting to fetch OneSignal players...');

    while (hasMore && apiCalls < 10) { // Prevent infinite loops
      apiCalls++;
      console.log(`📡 API Call ${apiCalls}: Fetching players offset ${offset}, limit ${limit}`);
      
      try {
        const url = `${ONESIGNAL_API_BASE}/players?app_id=${ONESIGNAL_APP_ID}&limit=${limit}&offset=${offset}`;
        console.log('🌐 Request URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ OneSignal API Error Response:', errorText);
          
          return NextResponse.json(
            { 
              success: false,
              message: `OneSignal API error: ${response.status} - ${response.statusText}`,
              details: errorText,
              apiCall: apiCalls
            },
            { status: 500 }
          );
        }

        const data = await response.json();
        console.log('📦 API Response keys:', Object.keys(data));
        console.log('📦 Total count from API:', data.total_count);
        
        const players = data.players || [];
        console.log(`📥 Received ${players.length} players in this batch`);
        console.log(`📥 Received players: ${JSON.stringify(players, null, 2)}`);
        
        if (players.length > 0) {
          console.log('👤 Sample player structure:', {
            id: players[0].id,
            notification_types: players[0].notification_types,
            invalid_identifier: players[0].invalid_identifier,
            test_type: players[0].test_type,
            created_at: players[0].created_at,
            last_active: players[0].last_active
          });
        }
        
        allPlayers.push(...players);
        totalFetched += players.length;
        
        // Check if there are more players
        hasMore = players.length === limit && totalFetched < (data.total_count || 0);
        offset += limit;
        
        console.log(`📈 Progress: ${totalFetched} / ${data.total_count || 'unknown'} players fetched`);
        
        // Add delay to prevent rate limiting
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        return NextResponse.json(
          { 
            success: false,
            message: `Network error while fetching OneSignal data: ${fetchError.message}`,
            apiCall: apiCalls
          },
          { status: 500 }
        );
      }
    }

    console.log(`✅ Total OneSignal players fetched: ${allPlayers.length}`);

    if (allPlayers.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: "No players found in OneSignal. This might indicate an API configuration issue.",
          debug: {
            totalApiCalls: apiCalls,
            appIdUsed: ONESIGNAL_APP_ID,
            // Don't log the full API key for security
            apiKeyLength: ONESIGNAL_REST_API_KEY?.length || 0
          }
        },
        { status: 200 }
      );
    }

    // Filter only valid subscribed players
    const subscribedPlayers = allPlayers.filter(player => {
      const isSubscribed = player.notification_types > 0;
      const isValid = player.invalid_identifier !== true;
      const isNotTest = player.test_type !== 1;
      
      return isSubscribed && isValid && isNotTest;
    });

    console.log(`🔔 Valid subscribed players: ${subscribedPlayers.length} out of ${allPlayers.length}`);

    if (subscribedPlayers.length === 0) {
      return NextResponse.json(
        { 
          success: true,
          message: "No active subscribers found in OneSignal",
          summary: {
            oneSignalTotal: allPlayers.length,
            oneSignalSubscribed: 0,
            localCreated: 0,
            localUpdated: 0,
            errors: 0
          }
        },
        { status: 200 }
      );
    }

    // Find or create default group
    let defaultGroup = await prisma.group.findFirst({
      where: { name: 'All Subscribers' }
    });

    if (!defaultGroup) {
      console.log('📁 Creating default "All Subscribers" group...');
      defaultGroup = await prisma.group.create({
        data: {
          name: 'All Subscribers',
          description: 'Default group for all subscribers synced from OneSignal'
        }
      });
      console.log('✅ Default group created with ID:', defaultGroup.id);
    }

    // Sync with local database
    let created = 0;
    let updated = 0;
    let errors = 0;
    const processedPlayers = [];

    console.log('💾 Starting database sync...');

    for (let i = 0; i < subscribedPlayers.length; i++) {
      const player = subscribedPlayers[i];
      
      try {
        console.log(`🔄 Processing player ${i + 1}/${subscribedPlayers.length}: ${player.id}`);
        
        // Extract mobile number from player data
        const mobile = extractMobileFromPlayer(player);
        
        // Check if subscriber already exists
        const existingSubscriber = await prisma.subscriber.findFirst({
          where: { playerId: player.id }
        });

        if (existingSubscriber) {
          // Update existing subscriber
          const updatedSubscriber = await prisma.subscriber.update({
            where: { id: existingSubscriber.id },
            data: {
              mobile: mobile || existingSubscriber.mobile,
              updatedAt: new Date(),
            }
          });
          
          updated++;
          console.log(`🔄 Updated existing subscriber: ${player.id}`);
          processedPlayers.push({ action: 'updated', playerId: player.id, dbId: updatedSubscriber.id });
          
        } else {
          // Create new subscriber
          const newSubscriber = await prisma.subscriber.create({
            data: {
              playerId: player.id,
              mobile: mobile,
              groups: {
                connect: { id: defaultGroup.id }
              }
            }
          });
          
          created++;
          console.log(`➕ Created new subscriber: ${player.id}`);
          processedPlayers.push({ action: 'created', playerId: player.id, dbId: newSubscriber.id });
        }
        
      } catch (dbError) {
        console.error(`❌ Database error for player ${player.id}:`, dbError);
        errors++;
        processedPlayers.push({ action: 'error', playerId: player.id, error: dbError.message });
      }
    }

    // Get final counts
    const totalLocalSubscribers = await prisma.subscriber.count();
    
    console.log('✅ OneSignal sync completed!');
    console.log(`📊 Final Results:`);
    console.log(`   • OneSignal total players: ${allPlayers.length}`);
    console.log(`   • OneSignal subscribed players: ${subscribedPlayers.length}`);
    console.log(`   • Local subscribers created: ${created}`);
    console.log(`   • Local subscribers updated: ${updated}`);
    console.log(`   • Errors encountered: ${errors}`);
    console.log(`   • Total local subscribers now: ${totalLocalSubscribers}`);

    return NextResponse.json({
      success: true,
      message: `OneSignal sync completed successfully! Created ${created}, updated ${updated} subscribers.`,
      summary: {
        oneSignalTotal: allPlayers.length,
        oneSignalSubscribed: subscribedPlayers.length,
        localCreated: created,
        localUpdated: updated,
        errors: errors,
        totalLocalSubscribers: totalLocalSubscribers
      },
      debug: {
        apiCalls: apiCalls,
        processedPlayers: processedPlayers.slice(0, 10), // Show first 10 for debugging
        defaultGroupId: defaultGroup.id
      }
    });

  } catch (error) {
    console.error('❌ OneSignal sync failed with error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: "Sync failed with unexpected error",
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to extract mobile number from OneSignal player data
function extractMobileFromPlayer(player) {
  try {
    // Check various places where mobile number might be stored
    
    // 1. Check tags
    if (player.tags) {
      if (player.tags.mobile) return player.tags.mobile;
      if (player.tags.phone) return player.tags.phone;
      if (player.tags.phoneNumber) return player.tags.phoneNumber;
    }
    
    // 2. Check external_user_id (if it looks like a phone number)
    if (player.external_user_id) {
      const cleaned = player.external_user_id.replace(/[^\d+]/g, '');
      if (cleaned.length >= 10 && /^\+?[\d]{10,15}$/.test(cleaned)) {
        return player.external_user_id;
      }
    }
    
    // 3. Check custom attributes or additional fields
    if (player.custom && typeof player.custom === 'object') {
      for (const [key, value] of Object.entries(player.custom)) {
        if (key.toLowerCase().includes('mobile') || key.toLowerCase().includes('phone')) {
          return value;
        }
      }
    }
    
    return null; // No mobile number found
  } catch (error) {
    console.error('Error extracting mobile from player:', error);
    return null;
  }
}

// GET endpoint to check sync status
export async function GET(request) {
  try {
    await requireRole(["ADMIN"]);

    console.log('🔍 Checking sync status...');

    // Get local subscriber count
    const localCount = await prisma.subscriber.count();
    console.log('📊 Local subscribers:', localCount);
    
    // Get OneSignal subscriber count
    let oneSignalCount = 0;
    let oneSignalError = null;
    
    try {
      const response = await fetch(
        `${ONESIGNAL_API_BASE}/players?app_id=${ONESIGNAL_APP_ID}&limit=1`,
        {
          headers: {
            'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        oneSignalCount = data.total_count || 0;
        console.log('📊 OneSignal total count:', oneSignalCount);
      } else {
        oneSignalError = `API Error: ${response.status}`;
        console.error('❌ OneSignal API error:', response.status);
      }
    } catch (error) {
      oneSignalError = error.message;
      console.error('❌ OneSignal fetch error:', error);
    }

    return NextResponse.json({
      localSubscribers: localCount,
      oneSignalSubscribers: oneSignalCount,
      syncNeeded: oneSignalCount !== localCount,
      oneSignalError: oneSignalError,
      lastSyncCheck: new Date().toISOString(),
      credentials: {
        appIdConfigured: !!ONESIGNAL_APP_ID,
        apiKeyConfigured: !!ONESIGNAL_REST_API_KEY
      }
    });

  } catch (error) {
    console.error('❌ Sync status check failed:', error);
    return NextResponse.json(
      { 
        message: "Failed to check sync status",
        error: error.message
      },
      { status: 500 }
    );
  }
}