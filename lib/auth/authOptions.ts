import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { findUserByEmail, verifyPassword } from '@/lib/storage/hybridStorage';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials');
          return null;
        }

        console.log('[Auth] Attempting login for:', credentials.email);

        // Find user by email
        const user = findUserByEmail(credentials.email);
        if (!user) {
          console.log('[Auth] User not found:', credentials.email);
          return null;
        }

        console.log('[Auth] User found:', user.email, 'Role:', user.role);

        // Verify password
        const isValidPassword = await verifyPassword(credentials.password, user.password);
        console.log('[Auth] Password valid:', isValidPassword);
        
        if (!isValidPassword) {
          return null;
        }

        // Return user object (without password)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          fleetOwnerId: user.fleetOwnerId,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Add role and fleetOwnerId to token on sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.fleetOwnerId = (user as any).fleetOwnerId;
      }
      
      // Update token with latest user data on session update
      if (trigger === 'update' && token.id) {
        const latestUser = findUserByEmail(token.email as string);
        if (latestUser) {
          token.role = latestUser.role;
          token.fleetOwnerId = latestUser.fleetOwnerId;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add role, id, and fleetOwnerId to session
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).fleetOwnerId = token.fleetOwnerId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
