// src/lib/actions/invoice.ts
"use server"

import db from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"   

// 產生發票號碼：INV-YYYYMMDD-XXXX
async function generateInvoiceNumber(): Promise<string> {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
  
  // 找今天已有幾張發票
  const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
  
  const count = await db.invoice.count({
    where: {
      createdAt: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
  })

  const seq = String(count + 1).padStart(4, "0")
  return `INV-${dateStr}-${seq}`
}

// 將報價單轉為發票
export async function convertQuoteToInvoice(quoteId: string) {
  // 1. 檢查報價單是否存在
  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: {
      project: {
        select: { title: true },
      },
    },
  })

  if (!quote) {
    return { error: "報價單不存在" }
  }

  // 2. 檢查是否已轉過發票
  const existingInvoice = await db.invoice.findUnique({
    where: { quoteId },
  })

  if (existingInvoice) {
    return { error: "此報價單已轉為發票", invoiceId: existingInvoice.id }
  }

  // 3. 產生發票號碼並建立
  const invoiceNumber = await generateInvoiceNumber()

  const invoice = await db.invoice.create({
    data: {
      invoiceNumber,
      quoteId: quote.id,
      amount: quote.amount,
      details: quote.details,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 預設 30 天後到期
    },
  })

  revalidatePath("/admin/quotes")
  revalidatePath(`/admin/quotes/print/${quoteId}`)

  return { success: true, invoice }
}

// 更新發票狀態
export async function updateInvoiceStatus(
  invoiceId: string,
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"
) {
    const data: Prisma.InvoiceUpdateInput = { status }


  if (status === "PAID") {
    data.paidDate = new Date()
  }

  await db.invoice.update({
    where: { id: invoiceId },
    data,
  })

  revalidatePath("/admin/invoices")
  revalidatePath(`/admin/invoices/print/${invoiceId}`)

  return { success: true }
}

// 取得發票詳情
export async function getInvoiceByQuoteId(quoteId: string) {
  return db.invoice.findUnique({
    where: { quoteId },
  })
}
