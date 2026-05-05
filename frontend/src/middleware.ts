import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { nextUrl, nextauth } = req;
    const isLoggedIn = !!nextauth.token;
    
    // Si ya está logueado y trata de ir a login, mandarlo al home
    if (isLoggedIn && nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Rutas que NO requieren autenticación
        const isPublicPath = 
          pathname.startsWith('/login') || 
          pathname.startsWith('/register') || 
          pathname.startsWith('/catalogo') ||
          pathname.startsWith('/welcome') ||
          pathname.startsWith('/api/auth');

        if (isPublicPath) return true;
        
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)'],
};

