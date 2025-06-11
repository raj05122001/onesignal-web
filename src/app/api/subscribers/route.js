// src/app/api/subscribe/route.js
// Enhanced subscription endpoint that saves to both OneSignal and local DB

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request) {
  try {
    const { playerId, mobile } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { message: "Player ID is required" },
        { status: 400 }
      );
    }

    console.log('📱 Processing subscription:', { playerId, mobile });

    // Check if subscriber already exists
    let subscriber = await prisma.subscriber.findFirst({
      where: { playerId: playerId }
    });

    if (subscriber) {
      // Update existing subscriber
      subscriber = await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: {
          mobile: mobile || subscriber.mobile,
          updatedAt: new Date(),
        },
        include: {
          groups: true
        }
      });
      
      console.log('🔄 Updated existing subscriber:', subscriber.id);
    } else {
      // Find or create default group
      let defaultGroup = await prisma.group.findFirst({
        where: { name: 'All Subscribers' }
      });

      if (!defaultGroup) {
        defaultGroup = await prisma.group.create({
          data: {
            name: 'All Subscribers',
            description: 'Default group for all subscribers'
          }
        });
      }

      // Create new subscriber
      subscriber = await prisma.subscriber.create({
        data: {
          playerId: playerId,
          mobile: mobile,
          groups: {
            connect: { id: defaultGroup.id }
          }
        },
        include: {
          groups: true
        }
      });
      
      console.log('➕ Created new subscriber:', subscriber.id);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription processed successfully",
      subscriber: {
        id: subscriber.id,
        playerId: subscriber.playerId,
        mobile: subscriber.mobile,
        groups: subscriber.groups.map(g => g.name)
      }
    });

  } catch (error) {
    console.error('❌ Subscription processing failed:', error);
    return NextResponse.json(
      { 
        success: false,
        message: "Failed to process subscription",
        error: error.message 
      },
      { status: 500 }
    );
  }
}
