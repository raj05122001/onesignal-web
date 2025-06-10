
// =================================================================

// src/app/api/subscribers/unsubscribe/route.js
// API to unsubscribe users

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request) {
  try {
    const { playerId, mobile } = await request.json();

    if (!playerId && !mobile) {
      return NextResponse.json(
        { message: 'Player ID or mobile number is required' },
        { status: 400 }
      );
    }

    // Find subscriber by playerId or mobile
    const where = playerId ? { playerId } : { mobile };
    
    const subscriber = await prisma.subscriber.findFirst({
      where,
      include: { groups: true },
    });

    if (!subscriber) {
      return NextResponse.json(
        { message: 'Subscriber not found' },
        { status: 404 }
      );
    }

    // Remove from all groups (soft unsubscribe)
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        groups: {
          disconnect: subscriber.groups.map(group => ({ id: group.id })),
        },
      },
    });

    // Or completely delete subscriber (hard unsubscribe)
    // await prisma.subscriber.delete({
    //   where: { id: subscriber.id },
    // });

    return NextResponse.json({
      message: 'Successfully unsubscribed',
      subscriberId: subscriber.id
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
