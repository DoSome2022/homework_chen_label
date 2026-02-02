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
        verified: { label: "Verified Flag", type: "text" }, // 型別可設為 text 或 hidden
      },
async authorize(credentials) {
  // ── 情況 1：電子郵件 + 密碼 登入 ──
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
    const inputPhone = credentials.phone as string;

    // 新增：如果前端傳入 verified: "true"，表示 OTP 已在前台驗證過，直接信任並返回使用者資料
    if (credentials.verified === "true") {
      // 因為 OTP 記錄已被刪除，從 customerContact 關聯查詢對應使用者
      const contact = await db.customerContact.findFirst({
        where: { phone: inputPhone },
        include: { customer: true }, // 假設 customerContact 有 relation 到 user (customer)
      });

      if (!contact?.customer) {
        console.log("[authorize] verified=true 但找不到對應使用者，phone:", inputPhone);
        return null;
      }

      const user = contact.customer;

      return {
        id: user.id,
        email: user.email ?? null,
        name: user.name ?? "手機用戶",
        role: user.role,
        customerType: user.customerType,
      };
    }

    // 若沒有 verified 旗標，才執行原本的 OTP 驗證流程（保留您的 debug log）
    console.log("[authorize OTP] 輸入手機:", inputPhone);
    console.log("[authorize OTP] 輸入驗證碼:", credentials.otp as string);

    const otpRecord = await db.phoneOtp.findUnique({
      where: { phone: inputPhone },
      include: { user: true },
    });

    console.log("[authorize OTP] 是否找到 OTP 記錄:", !!otpRecord);

    if (otpRecord) {
      console.log("[authorize OTP] 儲存的驗證碼:", otpRecord.code);
      console.log("[authorize OTP] 儲存的到期時間:", otpRecord.expiresAt.toISOString());
      console.log("[authorize OTP] 目前時間:", new Date().toISOString());
      console.log("[authorize OTP] 驗證碼是否匹配:", otpRecord.code === (credentials.otp as string));
      console.log("[authorize OTP] 是否過期:", otpRecord.expiresAt < new Date());
    }

    if (!otpRecord) {
      console.log("[authorize OTP] 原因: 找不到 OTP 記錄");
      return null;
    }

    if (otpRecord.expiresAt < new Date()) {
      console.log("[authorize OTP] 原因: 驗證碼已過期");
      return null;
    }

    if (otpRecord.code !== (credentials.otp as string)) {
      console.log("[authorize OTP] 原因: 驗證碼不匹配");
      return null;
    }

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
          phone: inputPhone,
        },
      });
    }

    return {
      id: user.id,
      email: user.email ?? null,
      name: user.name ?? "手機用戶",
      role: user.role,
      customerType: user.customerType,
    };
  }

  // 其他情況一律拒絕
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