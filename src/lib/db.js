// lib/db.js
//
// Prisma client singleton for Next.js (handles hot-reload in dev)
// ---------------------------------------------------------------

import { PrismaClient } from '@prisma/client';

let prisma;

/**
 * In production we create a new PrismaClient once.
 * In development we attach it to `globalThis` to preserve
 * the connection across hot-reloads.
 */
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!globalThis._prisma) {
    globalThis._prisma = new PrismaClient();
  }
  prisma = globalThis._prisma;
}

export default prisma;
