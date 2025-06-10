// app/api/auth/[...nextauth]/route.js
//
// Bridges NextAuth into the App Router API layer
// ------------------------------------------------

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";   // same options you defined earlier

const handler = NextAuth(authOptions);

// ⬇️  Both GET *and* POST must be exported
export { handler as GET, handler as POST };
