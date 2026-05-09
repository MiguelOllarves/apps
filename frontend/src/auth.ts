import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "nexus-gastro-super-secret-key-latam",
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Clave", type: "password" }
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://10.100.5.199:4000'}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password
            }),
          });

          if (!res.ok) {
            return null;
          }

          const responseData = await res.json();
          const user = responseData.user;
          const accessToken = responseData.accessToken;

          if (user && user.id && accessToken) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              tenantId: user.tenantId,
              role: user.role,
              accessToken: accessToken,
            } as any;
          }
          return null;
        } catch (e) {
          console.error('[Auth] Login error:', e);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.tenantId = user.tenantId;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        (session as any).tenantId = token.tenantId;
        (session as any).role = token.role;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
};

export default NextAuth(authOptions);

