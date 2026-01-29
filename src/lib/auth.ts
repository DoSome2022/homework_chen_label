import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import db from "./db";
import { Role, CustomerType } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db) as Adapter,
  trustHost: true,
  session: { strategy: "jwt" },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "CUSTOMER",
          customerType: "NORMAL",
        };
      },
    }),

    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "tel" },
        otp: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        // ── 情況 1：Email + Password 登入 ──
        if (credentials.email && credentials.password) {
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            customerType: user.customerType,
          };
        }

        // ── 情況 2：手機號碼 + OTP 登入 ──
        if (credentials.phone && credentials.otp) {
  const otpRecord = await db.phoneOtp.findUnique({
    where: { phone: credentials.phone as string },
    include: { user: true },
  });

  if (!otpRecord) return null;
  if (otpRecord.expiresAt < new Date()) return null;
  if (otpRecord.code !== (credentials.otp as string)) return null;

  let user = otpRecord.user;

  if (!user) {
    user = await db.user.create({
      data: {
        role: "CUSTOMER",
        customerType: "NORMAL",
      },
    });

    await db.customerContact.create({
      data: {
        customerId: user.id,
        name: "新用戶（手機註冊）",
        phone: credentials.phone as string,
      },
    });
  }

  // 直接使用 user（已確保非 null）
  return {
    id: user.id,
    email: user.email ?? null,
    name: user.name ?? "手機用戶",
    role: user.role,
    customerType: user.customerType,
  };
}

        return null;
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        const existing = await db.user.findUnique({
          where: { email: profile.email },
        });

        if (!existing) {
          await db.user.create({
            data: {
              email: profile.email,
              name: profile.name ?? null,
              image: profile.picture ?? null,
              role: "CUSTOMER",
              customerType: "NORMAL",
            },
          });
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.customerType = user.customerType;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.customerType = token.customerType as CustomerType | null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  debug: process.env.NODE_ENV === "development",
});