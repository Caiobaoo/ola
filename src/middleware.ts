import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = new URL(req.url);

  const publicRoutes = ['/login', '/signup', 'reset-password'];

  if (userId && publicRoutes.includes(url.pathname)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (!userId && !publicRoutes.includes(url.pathname)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
});

export const config = {
  matcher: [
    // Captura todas as páginas e APIs
    '/((?!_next|.*\\..*).*)',
  ],
};
