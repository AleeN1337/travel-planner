import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
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
      if (user?.id) token.sub = user.id;
      if (user?.name) token.name = user.name;
      if (user?.email) token.email = user.email;
      if (user?.image) token.picture = user.image;

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
