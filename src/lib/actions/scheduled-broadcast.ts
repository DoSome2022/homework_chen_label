// src/lib/actions/scheduled-broadcast.ts
'use server'

import db from "@/lib/db"
import { revalidatePath } from "next/cache"

/**
 * 檢查並發布已到期的排程廣播
 */
export async function checkAndSendScheduledBroadcasts() {
  const now = new Date()

  // 找出所有已到排程時間且狀態為 DRAFT 的廣播
  const dueBroadcasts = await db.broadcast.findMany({
    where: {
      status: "DRAFT",
      scheduledAt: {
        lte: now, // 排程時間已到
      },
    },
    select: { id: true, title: true },
  })

  if (dueBroadcasts.length === 0) return { published: 0 }

  console.log(`[Scheduled] 找到 ${dueBroadcasts.length} 筆到期排程廣播`)

  // 逐筆發布
  for (const broadcast of dueBroadcasts) {
    await db.broadcast.update({
      where: { id: broadcast.id },
      data: {
        status: "PUBLISHED",
        publishedAt: now,
      },
    })

    console.log(`[Scheduled] 已發布: ${broadcast.title}`)

    // 這裡觸發發送通知
    try {
      const { sendBroadcastToAllCustomers } = await import("@/lib/notifications/broadcast")
      sendBroadcastToAllCustomers(broadcast.id).catch(err => {
        console.error(`[Scheduled] 發送通知失敗:`, err)
      })
    } catch (err) {
      console.error(`[Scheduled] 載入 notify 模組失敗:`, err)
    }
  }

  revalidatePath("/dashboard/admin/broadcasts")

  return { published: dueBroadcasts.length }
}
