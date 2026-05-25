import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import { sanitizeEnvValue } from "@/lib/auth-env";
import { authorizeCredentials } from "@/lib/auth/credentials-authorize";

class UnverifiedEmail extends CredentialsSignin {
  code = "unverified";
}

class InvalidCredentials extends CredentialsSignin {
  code = "invalid";
}

const googleId = sanitizeEnvValue(process.env.AUTH_GOOGLE_ID);
const googleSecret = sanitizeEnvValue(process.env.AUTH_GOOGLE_SECRET);

export const authProviders: NextAuthConfig["providers"] = [
  ...(googleId && googleSecret ?
    [
      Google({
        clientId: googleId,
        clientSecret: googleSecret,
      }),
    ]
  : []),
  Credentials({
    id: "credentials",
    name: "E-mail i hasło",
    credentials: {
      email: { label: "E-mail", type: "email" },
      password: { label: "Hasło", type: "password" },
    },
    async authorize(credentials) {
      const result = await authorizeCredentials({
        email: String(credentials?.email ?? ""),
        password: String(credentials?.password ?? ""),
      });
      if (!result.ok) {
        if (result.error.includes("nie jest aktywne")) throw new UnverifiedEmail();
        throw new InvalidCredentials();
      }
      return result.user;
    },
  }),
];
