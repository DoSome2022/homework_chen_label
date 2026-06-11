// src/lib/actions/daily-promotion.ts
'use server'

import { revalidatePath } from "next/cache"
import db from "@/lib/db"
import { getOnThisDay } from "@/lib/wikipedia"

const PRODUCT_COUNT = 3

export async function generateDailyPromotion() {
  console.log("[DailyPromotion] 開始產生每日推廣...")

  // 1️⃣ 抓取今日資訊（內部用，不暴露來源）
  const { title: todayTitle, holidays } = await getOnThisDay()
  console.log(`[DailyPromotion] 今日標題: ${todayTitle}`)

  // 2️⃣ 隨機撈產品
  const products = await db.$queryRaw<Array<{
    id: string
    name: string
    price: number
    description: string | null
  }>>`
    SELECT p.id, p.name, p.price, p.description
    FROM "Product" p
    WHERE p."isArchived" = false
    ORDER BY RANDOM()
    LIMIT ${PRODUCT_COUNT}
  `

  console.log(`[DailyPromotion] 隨機選取 ${products.length} 個產品`)

  // 3️⃣ 生成標題
  const today = new Date()
  const dateStr = `${today.getMonth() + 1}/${today.getDate()}`
  const title = `🎁 ${dateStr} 優惠特輯 — ${todayTitle}`

  // 4️⃣ 生成內容（HK$ + 無維基痕跡）
  const productList = products
    .map((p, i) => {
      const priceStr = `HK$${p.price.toLocaleString("zh-HK")}`
      return [
        `　**${i + 1}. ${p.name}**`,
        `　　💰 優惠價：${priceStr}`,
        p.description
          ? `　　📝 ${p.description.slice(0, 60)}${p.description.length > 60 ? "..." : ""}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    })
    .join("\n\n")

  // ⭐ 只保留節日，移除歷史事件
  let holidaySection = ""
  if (holidays.length > 0) {
    holidaySection = `\n\n🌟 **關注**：${holidays.join("、")}`
  }

  const content = [
    `🔥 **每日驚喜優惠 — ${dateStr}** 🔥`,
    ``,
    `親愛的顧客您好，今天為您精選了 ${PRODUCT_COUNT} 款超值商品，`,
    `數量有限，售完為止！🎉`,
    ``,
    productList,
    ``,
    `💡 以上商品皆為限時優惠，快來選購吧！`,
    holidaySection,
    ``,
    `---`,
   ,
  ].join("\n")

  // 5️⃣ 設定排程時間：明天早上 8:00
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(8, 0, 0, 0)

 const publishAt = new Date(Date.now() + 60 * 1000) 

  // 6️⃣ 檢查今天是否已經有每日推廣
  const existingPromotion = await db.broadcast.findFirst({
    where: { isDailyPromotion: true },
    orderBy: { createdAt: "desc" },
  })

  let broadcast
  if (existingPromotion) {
    broadcast = await db.broadcast.update({
      where: { id: existingPromotion.id },
            data: { 
        title, 
        content, 
        scheduledAt: publishAt,  // ← 改為 1 分鐘後
        status: "DRAFT",         // ← 確保重置為 DRAFT，讓 cron 可以抓取
      },
    })
    console.log(`[DailyPromotion] 更新既有推廣 ID: ${broadcast.id}`)
  } else {
    broadcast = await db.broadcast.create({
      data: {
        title,
        content,
        isDailyPromotion: true,
        scheduledAt: publishAt,  // ← 1 分鐘後
        status: "DRAFT",
        authorId: await getSystemUserId(),
      },
    })
    console.log(`[DailyPromotion] 新增推廣 ID: ${broadcast.id}`)
  }

  revalidatePath("/dashboard/admin/broadcasts")
  revalidatePath("/dashboard")

  return { success: true, broadcastId: broadcast.id }
}

/**
 * 預覽今天的推廣內容（不寫入 DB）
 */
export async function previewDailyPromotion() {
  const { title: todayTitle, holidays } = await getOnThisDay()

  const products = await db.$queryRaw<Array<{
    id: string
    name: string
    price: number
  }>>`
    SELECT id, name, price
    FROM "Product"
    WHERE "isArchived" = false
    ORDER BY RANDOM()
    LIMIT ${PRODUCT_COUNT}
  `

  return {
    date: new Date().toISOString(),
    todayTitle,
    holidays,
    selectedProducts: products,
  }
}

async function getSystemUserId(): Promise<string> {
  const admin = await db.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  })
  if (admin) return admin.id

  const anyUser = await db.user.findFirst({ select: { id: true } })
  if (anyUser) return anyUser.id

  throw new Error("資料庫中沒有任何用戶")
}
