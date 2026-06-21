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

// ✅ 每日推廣生成 Cron（每天凌晨 0:05 執行）
export async function runDailyPromotionCron() {
  try {
    console.log("[Cron] 開始執行每日推廣生成...")
    await generateDailyPromotionCron()
    console.log("[Cron] 每日推廣生成完成")
  } catch (error) {
    console.error("[Cron] 每日推廣生成失敗:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    // ✅ 不要讓錯誤導致整個進程崩潰
  }
}

// ✅ 排程廣播 Cron（每小時檢查一次）
export async function runScheduledBroadcastCron() {
  try {
    console.log("[Cron] 開始檢查排程廣播...")
    await checkScheduledBroadcastsCron()
    console.log("[Cron] 排程廣播檢查完成")
  } catch (error) {
    console.error("[Cron] 排程廣播檢查失敗:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
  }
}

// ============================================
// ✅ 使用 node-cron 或 setInterval
// ============================================
import cron from 'node-cron'

// 每天凌晨 0:05 執行
cron.schedule('5 0 * * *', async () => {
  await runDailyPromotionCron()
})

// 每小時執行一次
cron.schedule('0 * * * *', async () => {
  await runScheduledBroadcastCron()
})

console.log('[Cron] 所有排程任務已啟動')