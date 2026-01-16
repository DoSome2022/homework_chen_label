// types/next-auth.d.ts 或 src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
import { Role, CustomerType } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      customerType?: CustomerType | null
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
    customerType?: CustomerType | null
  }
}

// ▼▼▼ 新增這一段：擴充 AdapterUser ▼▼▼
// 這是為了解決 PrismaAdapter 回傳的型別問題
declare module "next-auth/adapters" {
  interface AdapterUser {
    role: Role
    customerType?: CustomerType | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    customerType?: CustomerType | null
  }
}
