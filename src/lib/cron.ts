// src/lib/cron.ts
import cron from "node-cron"
import { generateDailyPromotion } from "@/lib/actions/daily-promotion"
import { checkAndSendScheduledBroadcasts } from "./actions/scheduled-broadcast"


/**
 * 啟動所有排程任務
 * 在 Next.js 應用啟動時呼叫此函式
 */
export function startScheduledJobs() {
  console.log("[Cron] 啟動排程任務...")

  // 1. 每日午夜 00:00 自動產生每日推廣
  cron.schedule("0 0 * * *", async () => {
    console.log("[Cron] 開始執行每日推廣生成...")
    try {
      const result = await generateDailyPromotion()
      console.log(`[Cron] 每日推廣生成完成:`, result)
    } catch (error) {
      console.error("[Cron] 每日推廣生成失敗:", error)
    }
  })

  // 2. 每分鐘檢查一次到期的排程廣播並自動發布
  cron.schedule("* * * * *", async () => {
    try {
      await checkAndSendScheduledBroadcasts()
    } catch (error) {
      console.error("[Cron] 檢查排程廣播失敗:", error)
    }
  })

  console.log("[Cron] 排程任務已啟動")
}
