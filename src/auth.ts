import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { sharedAuthConfig } from "@/auth.config.shared";
import { authProviders } from "@/lib/auth/providers";
import { getDb } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...sharedAuthConfig,
  providers: authProviders,
  adapter: PrismaAdapter(getDb()),
  callbacks: {
    ...sharedAuthConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.id) {
        await getDb().user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
      return true;
    },
  },
});
