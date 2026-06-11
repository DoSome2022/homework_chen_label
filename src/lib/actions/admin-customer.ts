// src/lib/actions/admin-customer.ts
'use server'

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import db from "../db"
import {
  createProjectSchema,
  createQuoteSchema,
} from "@/lib/schemas/customer"  // ← 從這裡匯入
import bcrypt from "bcryptjs"

// 切換客戶類型
export async function toggleCustomerType(id: string, newType: "NORMAL" | "POTENTIAL") {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  await db.user.update({
    where: { id },
    data: { customerType: newType },
  })

  revalidatePath("/admin/customers")
}

// 為客戶建立新項目
export async function createProjectForCustomer(customerId: string, formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  const raw = Object.fromEntries(formData)
  const parsed = createProjectSchema.parse(raw)

  await db.project.create({
    data: {
      title: parsed.title,
      description: parsed.description || null,
      customerId,
    },
  })

  revalidatePath(`/admin/customers/${customerId}`)
}

// 為項目建立報價
export async function createQuote(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  const raw = Object.fromEntries(formData)
  const parsed = createQuoteSchema.parse(raw)

  await db.quote.create({
    data: {
      projectId: parsed.projectId,
      amount: parsed.amount,
      details: parsed.details || null,
    },
  })

  revalidatePath("/admin/customers") // 或更精確路徑
}


// ── 新增：建立客戶 ──
export async function createCustomer(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const phone = formData.get("phone") as string
  const customerType = formData.get("customerType") as "NORMAL" | "POTENTIAL" | null
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return { error: "姓名、Email、密碼為必填" }
  }
  // 檢查 Email 是否已被使用
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "此 Email 已被註冊" }
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  // 使用交易：建立 User + 可選 PhoneOtp
  await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        role: "CUSTOMER",
        customerType: customerType || "NORMAL",
      },
    })
    // 若有填寫電話，同時建立 PhoneOtp 記錄
    if (phone?.trim()) {
      // 先檢查此電話是否已被使用
      const existingOtp = await tx.phoneOtp.findUnique({
        where: { phone: phone.trim() },
      })
      if (!existingOtp) {
        await tx.phoneOtp.create({
          data: {
            phone: phone.trim(),
            code: "000000", // 佔位用驗證碼
            userId: user.id,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 一年後過期
          },
        })
      }
    }
  })
  revalidatePath("/dashboard/admin/customers")
  return { success: true }
}
// ── 新增：刪除客戶 ──
export async function deleteCustomer(userId: string) {
  // 檢查是否存在
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  if (!user) {
    return { error: "客戶不存在" }
  }
  if (user.role !== "CUSTOMER") {
    return { error: "只能刪除客戶角色" }
  }
  // 由於 Schema 已設定 Cascade，關聯資料會自動刪除
  await db.user.delete({
    where: { id: userId },
  })
  revalidatePath("/dashboard/admin/customers")
  return { success: true }
}