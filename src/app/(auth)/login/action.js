// app/(auth)/login/action.js
'use server';

/**
 * Server-Action helper used by the <LoginPage/> client component.
 * --------------------------------------------------------------
 *  • Verifies user credentials with Prisma + bcrypt
 *  • On success: issues a signed JWT* and stores it as http-only cookie
 *  • On failure: throws an Error (caught in the calling component)
 *
 *  (*) You can swap this out for NextAuth’s built-in `/api/auth/*`
 *      routes if you prefer.  The point of this file is to show
 *      how a “pure” Server Action could work with zero API hops.
 */

import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

const SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_NEXTAUTH_SECRET);

/* ------------------------------------------------------------------
   Helper → sign JWT (7-day expiry)
------------------------------------------------------------------- */
async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);
}

/* ------------------------------------------------------------------
   Action: authenticate()   ← called from client
------------------------------------------------------------------- */
export async function authenticate(prevState, formData) {
  const email = (formData.get('email') || '').toString().trim().toLowerCase();
  const password = (formData.get('password') || '').toString();

  if (!email || !password) {
    throw new Error('Email and password required');
  }

  /* 1) Look-up user  */
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true, role: true },
  });
  if (!user) throw new Error('Invalid credentials');

  /* 2) Compare hashed password  */
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');

  /* 3) Sign JWT + set cookie  */
  const token = await signToken({ id: user.id, role: user.role });
  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  /* 4) Return a value the client can use (optional) */
  return { success: true, role: user.role };
}
