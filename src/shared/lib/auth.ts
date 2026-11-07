import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { userRepository } from '@/features/auth/repository/user.repository';
import { sendWelcomeEmail } from '@/features/auth/service/auth-email.service';
import { upsertOAuthUserService } from '@/features/auth/service/auth.service';
import { DEFAULT_LOCALE } from '@/shared/const/i18n.const';
import { hasRole } from '@/shared/utils/admin';
import { hashPassword } from '@/shared/utils/password';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await userRepository.findByEmail(credentials.email as string);
        if (!user) return null;

        const passwordHash = hashPassword(credentials.password as string);
        if (user.passwordHash !== passwordHash) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as 'teacher' | 'student',
          avatar: user.avatar,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google' || !user.email || !user.name) {
        return true;
      }

      const { isNew } = await upsertOAuthUserService({
        email: user.email,
        name: user.name,
        avatar: user.image ?? null,
      });
      if (isNew) await sendWelcomeEmail({ email: user.email, name: user.name }, 'student', DEFAULT_LOCALE);

      return true;
    },

    async jwt({ token, user }) {
      const authUser = user as ({ role?: 'teacher' | 'student'; avatar?: string | null } & typeof user) | undefined;

      if (user) {
        token.id = authUser?.id ?? token.sub ?? '';
        token.email = user.email;
        token.name = user.name;
        token.avatar = authUser?.avatar ?? (token.avatar as string | null | undefined);
      }

      if (token.email) {
        const dbUser = await userRepository.findByEmail(token.email as string);
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.avatar = dbUser.avatar ?? (token.avatar as string | null | undefined);
          token.role = (dbUser.role as 'teacher' | 'student') ?? 'student';
          // Only new email sign-ups carry false until they enter their code.
          token.isVerified = dbUser.emailVerified !== false;
          token.isAdmin = hasRole(dbUser.roles, 'admin');
        } else {
          token.role = 'student';
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        const user = session.user as typeof session.user & {
          id: string;
          role: 'teacher' | 'student';
          avatar?: string | null;
          isVerified: boolean;
          isAdmin: boolean;
        };
        user.id = token.id as string;
        user.email = token.email as string;
        user.name = token.name as string;
        user.avatar = (token.avatar as string | null | undefined) ?? null;
        user.role = (token.role as 'teacher' | 'student' | undefined) ?? 'student';
        user.isVerified = token.isVerified !== false;
        user.isAdmin = token.isAdmin === true;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
});
