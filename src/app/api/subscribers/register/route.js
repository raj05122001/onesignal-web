// src/app/api/subscribers/register/route.js
// API to register new subscribers with mobile number

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request) {
  try {
    const { playerId, mobile } = await request.json();

    // Validation
    if (!playerId || !mobile) {
      return NextResponse.json(
        { message: 'Player ID and mobile number are required' },
        { status: 400 }
      );
    }

    // Validate mobile number format (basic validation)
    const mobileRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!mobileRegex.test(mobile.replace(/\s/g, ''))) {
      return NextResponse.json(
        { message: 'Invalid mobile number format' },
        { status: 400 }
      );
    }

    // Clean mobile number (remove spaces and formatting)
    const cleanMobile = mobile.replace(/\s/g, '');

    // Check if subscriber already exists by playerId
    const existingByPlayerId = await prisma.subscriber.findUnique({
      where: { playerId },
      include: { groups: true },
    });

    if (existingByPlayerId) {
      // Update mobile number if different
      if (existingByPlayerId.mobile !== cleanMobile) {
        const updatedSubscriber = await prisma.subscriber.update({
          where: { playerId },
          data: { mobile: cleanMobile },
          include: { groups: true },
        });
        
        return NextResponse.json({ 
          message: 'Mobile number updated successfully',
          subscriber: updatedSubscriber,
          isNew: false
        });
      }
      
      return NextResponse.json({ 
        message: 'Subscriber already exists',
        subscriber: existingByPlayerId,
        isNew: false
      });
    }

    // Check if mobile number already exists (optional - remove if you want to allow duplicate numbers)
    const existingByMobile = await prisma.subscriber.findFirst({
      where: { mobile: cleanMobile },
    });

    if (existingByMobile) {
      return NextResponse.json(
        { message: 'This mobile number is already registered with another device' },
        { status: 409 }
      );
    }

    // Get or create default "All Subscribers" group
    let defaultGroup = await prisma.group.findFirst({
      where: { name: 'All Subscribers' },
    });

    if (!defaultGroup) {
      defaultGroup = await prisma.group.create({
        data: {
          name: 'All Subscribers',
          description: 'Default group containing every subscriber',
        },
      });
    }

    // Create new subscriber
    const newSubscriber = await prisma.subscriber.create({
      data: {
        playerId,
        mobile: cleanMobile,
        groups: {
          connect: { id: defaultGroup.id },
        },
      },
      include: { groups: true },
    });

    return NextResponse.json({
      message: 'Subscriber registered successfully',
      subscriber: newSubscriber,
      isNew: true
    }, { status: 201 });

  } catch (error) {
    console.error('Subscriber registration error:', error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Subscriber with this Player ID already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
