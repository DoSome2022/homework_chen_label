// src/lib/actions/import-customers.ts
"use server"

import db from "@/lib/db"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

interface CustomerRow {
  name: string
  email: string
  password: string
  phone?: string
  customerType?: "NORMAL" | "POTENTIAL"
}

export async function importCustomers(rows: CustomerRow[]) {
  const results = {
    success: 0,
    skipped: 0,
    errors: [] as { row: number; reason: string }[],
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2 // 第 1 行是標題，所以資料從第 2 行開始

    try {
      // 基本驗證
      if (!row.name?.trim() || !row.email?.trim() || !row.password?.trim()) {
        results.errors.push({ row: rowNum, reason: "姓名、Email、密碼為必填" })
        continue
      }

      // 檢查 Email 格式
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        results.errors.push({ row: rowNum, reason: `Email 格式無效: ${row.email}` })
        continue
      }

      // 檢查 Email 是否已存在
      const existing = await db.user.findUnique({
        where: { email: row.email.trim() },
        select: { id: true },
      })
      if (existing) {
        results.skipped++
        results.errors.push({ row: rowNum, reason: `Email 已存在: ${row.email}` })
        continue
      }

      const hashedPassword = await bcrypt.hash(row.password, 10)

      await db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: row.name.trim(),
            email: row.email.trim(),
            password: hashedPassword,
            role: "CUSTOMER",
            customerType: row.customerType === "POTENTIAL" ? "POTENTIAL" : "NORMAL",
          },
        })

        // 如果有電話，建立 PhoneOtp
        if (row.phone?.trim()) {
          const existingOtp = await tx.phoneOtp.findUnique({
            where: { phone: row.phone.trim() },
          })
          if (!existingOtp) {
            await tx.phoneOtp.create({
              data: {
                phone: row.phone.trim(),
                code: "IMPORTED",
                userId: user.id,
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              },
            })
          }
        }
      })

      results.success++
    } catch (err) {
      results.errors.push({
        row: rowNum,
        reason: err instanceof Error ? err.message : "未知錯誤",
      })
    }
  }

  revalidatePath("/dashboard/admin/customers")
  return results
}
