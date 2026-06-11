// src/app/api/cron/daily-promotion/route.ts
import { NextResponse } from "next/server"
import { generateDailyPromotion } from "@/lib/actions/daily-promotion"

export async function GET(request: Request) {
  // 🔒 安全驗證：檢查 secret token
  const authHeader = request.headers.get("authorization")
  const secret = process.env.CRON_SECRET

  if (!secret) {
    console.error("[Cron] 未設定 CRON_SECRET 環境變數")
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    )
  }

  // 支援兩種方式：
  // 1. Authorization: Bearer <secret>
  // 2. Query parameter: ?secret=<secret>
  const url = new URL(request.url)
  const querySecret = url.searchParams.get("secret")

  const isValid =
    authHeader === `Bearer ${secret}` || querySecret === secret

  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log("[Cron] 開始執行每日推廣更新...")
    const result = await generateDailyPromotion()
    console.log("[Cron] 每日推廣更新成功:", result)

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...result,
    })
  } catch (error) {
    console.error("[Cron] 每日推廣更新失敗:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知錯誤",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
