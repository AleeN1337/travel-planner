import type { NextAuthConfig } from "next-auth";
import {
  applySanitizedAuthEnv,
  sanitizeEnvValue,
} from "@/lib/auth-env";

applySanitizedAuthEnv();

const authSecret = sanitizeEnvValue(process.env.AUTH_SECRET);
if (authSecret) process.env.AUTH_SECRET = authSecret;

export const sharedAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        return !!auth?.user;
      }
      return true;
    },
    jwt({ token, user, profile }) {
      // Przy każdym nowym logowaniu nadpisz token (inny e-mail / provider)
      if (user) {
        token.sub = user.id;
        token.name = user.name ?? undefined;
        token.email = user.email ?? undefined;
        token.picture = user.image ?? undefined;
      }

      const googlePicture =
        profile && typeof profile === "object" && "picture" in profile ?
          (profile as { picture?: string }).picture
        : undefined;
      if (googlePicture) token.picture = googlePicture;

      return token;
    },
    session({ session, token }) {
      if (!session.user) return session;

      if (token.sub) session.user.id = token.sub;
      if (typeof token.name === "string") session.user.name = token.name;
      if (typeof token.email === "string") session.user.email = token.email;
      if (typeof token.picture === "string") session.user.image = token.picture;

      return session;
    },
  },
} satisfies NextAuthConfig;
