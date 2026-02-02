// src/lib/actions/auth.ts

'use server'

import { randomInt } from "crypto";
import { sendOtpSms } from "@/lib/sms";
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
    redirect: false,
    // redirectTo: "/dashboard",
  })
   redirect("/dashboard");
}
// 登出
export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}

// 建立初始 Admin（僅限首次使用，之後可刪除此頁面）
export async function createInitialAdmin(formData: FormData) {
  // const existingAdmin = await db.user.findFirst({ where: { role: "ADMIN" } })
  // if (existingAdmin) throw new Error("Admin 用戶已存在")

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


// ── 請求 OTP ──
export async function requestPhoneOtp(formData: FormData) {
  const phone = formData.get("phone") as string;

  if (!phone || phone.length < 8) {
    throw new Error("請輸入有效的電話號碼");
  }

  // 產生 6 位 OTP
  const code = randomInt(100000, 999999).toString();

  // 設定 5 分鐘過期
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // 查找或建立 OTP 記錄（upsert）
  await db.phoneOtp.upsert({
    where: { phone },
    update: {
      code,
      expiresAt,
      attempts: 0,
    },
    create: {
      phone,
      code,
      expiresAt,
    },
  });

  // 發送簡訊
  const sent = await sendOtpSms(phone, code);
  if (!sent) {
    throw new Error("簡訊發送失敗，請稍後再試");
  }

  // 回傳成功（前端進入第二階段）
  return { success: true, phone };
}
// ── 驗證 OTP 並登入 ──
export async function verifyPhoneOtp(formData: FormData) {
  const phone = formData.get("phone") as string;
  const code = formData.get("code") as string;

  if (!phone || !code || code.length !== 6) {
    throw new Error("驗證碼格式錯誤");
  }

  const otpRecord = await db.phoneOtp.findUnique({
    where: { phone },
    include: { user: true },
  });

  if (!otpRecord) {
    throw new Error("無效的驗證請求");
  }

  if (otpRecord.attempts >= 5) {
    throw new Error("驗證次數過多，請重新請求驗證碼");
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new Error("驗證碼已過期");
  }

  if (otpRecord.code !== code) {
    await db.phoneOtp.update({
      where: { phone },
      data: { attempts: { increment: 1 } },
    });
    throw new Error("驗證碼錯誤");
  }

  // 驗證成功 ── 刪除 OTP 記錄（一次性使用）
  await db.phoneOtp.delete({ where: { phone } });

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
        phone,
      },
    });
  }

  // 使用 signIn 建立 session，讓 NextAuth 處理 token 與 cookie
  const signInResult = await signIn("credentials", {
    phone,               // 傳 phone 給 authorize 辨識
    otp: code,           // 傳 otp（雖然不會用到比對）
    verified: "true",    // 自訂旗標，告訴 authorize 已通過驗證
    redirect: false,
  });

  if (signInResult?.error) {
    console.error("[verifyPhoneOtp] signIn error:", signInResult.error);
    throw new Error("登入失敗，請稍後再試");
  }

  return { success: true };
}