'use server'


import {  signIn, signOut } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { redirect } from "next/navigation"
import db from "../db"

// 註冊表單驗證
const registerSchema = z.object({
  name: z.string().min(2, "姓名至少 2 個字元"),
  email: z.string().email("請輸入有效的電子郵件"),
  password: z.string().min(6, "密碼至少 6 個字元"),
})

// 普通客戶註冊（角色預設為 CUSTOMER）
export async function registerCustomer(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = registerSchema.parse(raw)

  const existing = await db.user.findUnique({ where: { email: parsed.email } })
  if (existing) throw new Error("此電子郵件已被註冊")

  const hashedPassword = await bcrypt.hash(parsed.password, 10)

  await db.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      password: hashedPassword,
      role: "CUSTOMER",
      customerType: "NORMAL",
    },
  })

  // 註冊後自動登入
  await signIn("credentials", {
    email: parsed.email,
    password: parsed.password,
    redirect: false,
  })

  redirect("/dashboard")
}

// 登入 Action（使用 NextAuth credentials）
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  await signIn("credentials", {
    email,
    password,
    redirect: true,
    redirectTo: "/dashboard",
  })
}
// 登出
export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}

// 建立初始 Admin（僅限首次使用，之後可刪除此頁面）
export async function createInitialAdmin(formData: FormData) {
  const existingAdmin = await db.user.findFirst({ where: { role: "ADMIN" } })
  if (existingAdmin) throw new Error("Admin 用戶已存在")

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const hashed = await bcrypt.hash(password, 10)

  await db.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: "ADMIN",
    },
  })

  // 使用 signIn 的 redirect: true，讓 Auth.js 自動處理跳轉
  await signIn("credentials", {
    email,
    password,
    redirect: true,           // 啟用自動重定向
    redirectTo: "/dashboard", // 明確指定跳轉目標
  })

  // 這一行通常不會執行到，因為 redirect: true 會直接跳轉
  return { success: true }
}