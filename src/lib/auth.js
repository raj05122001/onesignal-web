// lib/auth.js
//
// NextAuth helpers (App Router - Next.js 15)
// -----------------------------------------
// • Credentials-based login only (no signup)
// • Prisma adapter for persistence
// • Exposes `auth()` → getServerSession()
// • `requireRole()` guard you can call inside
//   Server Actions / Server Components
// --------------------------------------------------------

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/* ─────────────────────────────────────────
   NextAuth configuration (exported below)
───────────────────────────────────────── */
export const authOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: 'jwt', // lighter than database sessions
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        // 1) Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) throw new Error('User not found');

        // 2) Compare hashed passwords
        const pwdValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!pwdValid) throw new Error('Invalid password');

        // 3) Return minimal user object → JWT payload
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],

  pages: {
    signIn: '/login', // our custom page
  },

  callbacks: {
    async jwt({ token, user }) {
      // Persist role/id on first login
      if (user) {
        token.id   = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // Surface role/id to the client
      if (session.user && token) {
        session.user.id   = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
};

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */

/**
 * Server-side session helper.
 * Usage (Server Component / Action):
 *   const session = await auth();
 */
export function auth() {
  return getServerSession(authOptions);
}

/**
 * Role-guard utility for Server Actions.
 * Example:
 *   export async function POST () {
 *     await requireRole(['ADMIN']);
 *     ...
 *   }
 *
 * @param {('ADMIN'|'SENDER')[]} roles
 */
export async function requireRole(roles = []) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  if (roles.length && !roles.includes(session.user.role)) {
    throw new Error('Forbidden – insufficient privileges');
  }
  return session;
}
