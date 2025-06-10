
// =================================================================

// src/app/api/subscribers/status/route.js
// API to check subscriber status

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request) {
  try {
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { message: 'Player ID is required' },
        { status: 400 }
      );
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { playerId },
      include: { 
        groups: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        }
      },
    });

    if (!subscriber) {
      return NextResponse.json({
        subscribed: false,
        subscriber: null
      });
    }

    return NextResponse.json({
      subscribed: true,
      subscriber: {
        id: subscriber.id,
        mobile: subscriber.mobile,
        createdAt: subscriber.createdAt,
        groups: subscriber.groups,
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}