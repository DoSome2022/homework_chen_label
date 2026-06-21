// // src/lib/cron.ts
// import cron from "node-cron"
// import { generateDailyPromotion } from "@/lib/actions/daily-promotion"
// import { checkAndSendScheduledBroadcasts } from "./actions/scheduled-broadcast"


// /**
//  * 啟動所有排程任務
//  * 在 Next.js 應用啟動時呼叫此函式
//  */
// export function startScheduledJobs() {
//   console.log("[Cron] 啟動排程任務...")

//   // 1. 每日午夜 00:00 自動產生每日推廣
//   cron.schedule("0 0 * * *", async () => {
//     console.log("[Cron] 開始執行每日推廣生成...")
//     try {
//       const result = await generateDailyPromotion()
//       console.log(`[Cron] 每日推廣生成完成:`, result)
//     } catch (error) {
//       console.error("[Cron] 每日推廣生成失敗:", error)
//     }
//   })

//   // 2. 每分鐘檢查一次到期的排程廣播並自動發布
//   cron.schedule("* * * * *", async () => {
//     try {
//       await checkAndSendScheduledBroadcasts()
//     } catch (error) {
//       console.error("[Cron] 檢查排程廣播失敗:", error)
//     }
//   })

//   console.log("[Cron] 排程任務已啟動")
// }


// src/lib/cron/index.ts

import { generateDailyPromotionCron } from "@/lib/actions/daily-promotion"
import { checkScheduledBroadcastsCron } from "@/lib/actions/admin-broadcast"
import cron from 'node-cron'

// 任務函數
export async function runDailyPromotionCron() {
  try {
    console.log("[Cron] 開始執行每日推廣生成...")
    const result = await generateDailyPromotionCron()
    console.log("[Cron] 每日推廣生成完成:", result.broadcastId)
  } catch (error) {
    console.error("[Cron] 每日推廣生成失敗:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
  }
}

export async function runScheduledBroadcastCron() {
  try {
    console.log("[Cron] 開始檢查排程廣播...")
    const result = await checkScheduledBroadcastsCron()
    console.log(`[Cron] 排程廣播檢查完成，發布了 ${result.published} 筆`)
  } catch (error) {
    console.error("[Cron] 排程廣播檢查失敗:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
  }
}

// ✅ 新增：啟動所有排程任務的函數
export function startScheduledJobs() {
  console.log('[Cron] 正在啟動排程任務...')

  // 每天凌晨 0:05 執行每日推廣生成
  cron.schedule('5 0 * * *', async () => {
    await runDailyPromotionCron()
  })

  // 每小時檢查一次排程廣播
  cron.schedule('0 * * * *', async () => {
    await runScheduledBroadcastCron()
  })

  console.log('[Cron] 所有排程任務已啟動')
  console.log('[Cron] - 每日推廣生成: 每天 00:05')
  console.log('[Cron] - 排程廣播檢查: 每小時整點')
}

// ✅ 如果需要在啟動時立即執行一次（可選）
export async function runInitialJobs() {
  console.log('[Cron] 執行初始任務...')
  await runDailyPromotionCron()
  await runScheduledBroadcastCron()
}