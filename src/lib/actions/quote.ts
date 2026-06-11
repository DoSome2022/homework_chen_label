'use server'


import { revalidatePath as nextRevalidate } from "next/cache"
import db from "@/lib/db"
import { createQuoteSchema } from "@/lib/schemas/quote"
import { Prisma } from "@prisma/client"          // ← 新增這行
// 權限檢查 Helper


// 1. 取得所有報價單
export async function getQuotes() {

  return await db.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        include: { customer: { select: { name: true } } }
      }
    }
  })
}

// 2. 【新增】取得「可用」的專案清單 (僅限進行中的專案)
export async function getAvailableProjects() {

  return await db.project.findMany({
    where: {
      status: { in: ["PENDING", "ASSIGNED"] }
    },
    select: {
      id: true,
      title: true
    },
    orderBy: { createdAt: "desc" }
  })
}

// 3. 建立報價單
export async function createQuote(data: {
  projectId: string;
  amount: number | string;  // 允許 string，因為 form 可能傳 string
  details?: string | null;
}) {
  // 確保 amount 轉換為 number
  const validated = createQuoteSchema.parse({
    projectId: data.projectId,
    amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
    details: data.details || undefined,
  })

  await db.quote.create({
    data: {
      projectId: validated.projectId,
      amount: validated.amount,
      details: validated.details,
    },
  })

  nextRevalidate("/dashboard/admin/quotes")
  return { success: true }
}

// 4. 【新增】更新報價單 (實現 CRUD 中的 U)
// 更新報價單
export async function updateQuote(id: string, data: {
  amount?: number;
  details?: string | null;
}) {
  // 如果有 amount，確保它是有效的數字
  const updateData: Prisma.QuoteUpdateInput = {}
  
  if (data.amount !== undefined) {
    if (typeof data.amount === 'string') {
      updateData.amount = parseFloat(data.amount)
    } else {
      updateData.amount = data.amount
    }
  }
  
  if (data.details !== undefined) {
    updateData.details = data.details
  }

  await db.quote.update({
    where: { id },
    data: updateData,
  })

  nextRevalidate("/dashboard/admin/quotes")
  return { success: true }
}

// 5. 刪除報價單
export async function deleteQuote(id: string) {

  await db.quote.delete({ where: { id } })
  nextRevalidate("/dashboard/admin/quotes")
  return { success: true }
}