// src/lib/actions/admin-customer.ts
'use server'

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import db from "../db"
import {
  createProjectSchema,
  createQuoteSchema,
} from "@/lib/schemas/customer"  // ← 從這裡匯入

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