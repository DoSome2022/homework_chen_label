// // src/components/admin/DailyPromotionSection.tsx

// import { previewDailyPromotion, generateDailyPromotion } from "@/lib/actions/daily-promotion"
// import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { Separator } from "@/components/ui/separator"

// export async function DailyPromotionSection() {
//   // ⭐ 定義一個標記了 "use server" 的函數
//   async function handleGenerate() {
//     "use server"
//     await generateDailyPromotion()
//   }

//   let preview: Awaited<ReturnType<typeof previewDailyPromotion>>

//   try {
//     preview = await previewDailyPromotion()
//   } catch (error) {
//     return (
//       <Card className="border-dashed border-yellow-300">
//         <CardHeader>
//           <CardTitle className="text-lg">📢 每日精選優惠</CardTitle>
//           <CardDescription>
//             無法載入預覽，請確認資料庫中有產品資料
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <p className="text-sm text-muted-foreground">
//             錯誤：{error instanceof Error ? error.message : "未知錯誤"}
//           </p>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <Card className="border-primary/20">
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <div>
//           <CardTitle className="text-lg">📢 每日精選優惠</CardTitle>
//           <CardDescription>
//             每日自動為您精選商品，組合成福袋推廣給客戶
//           </CardDescription>
//         </div>

//         {/* ⭐ 改用 handleGenerate */}
//         <form action={handleGenerate}>
//           <Button type="submit" variant="default" className="gap-2">
//             <span>🎲</span>
//             一鍵產生今日優惠
//           </Button>
//         </form>
//       </CardHeader>

//       {/* ... 其餘內容不變 ... */}
//       <CardContent className="space-y-4">
//         <Separator />

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-1">
//             <h4 className="text-sm font-medium text-muted-foreground">📰 今日主題</h4>
//             <p className="text-base font-semibold">{preview.todayTitle}</p>
//           </div>

//           <div className="space-y-1">
//             <h4 className="text-sm font-medium text-muted-foreground">📅 日期</h4>
//             <p className="text-base">
//               {new Date(preview.date).toLocaleDateString("zh-HK", {
//                 year: "numeric",
//                 month: "long",
//                 day: "numeric",
//                 weekday: "long",
//               })}
//             </p>
//           </div>
//         </div>

//         {preview.holidays.length > 0 && (
//           <div className="space-y-1">
//             <h4 className="text-sm font-medium text-muted-foreground">🌟 今日關注</h4>
//             <ul className="list-disc list-inside text-sm space-y-0.5">
//               {preview.holidays.map((h, i) => (
//                 <li key={i}>{h}</li>
//               ))}
//             </ul>
//           </div>
//         )}

//         <Separator />

//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <h4 className="text-sm font-medium text-muted-foreground">
//               🎯 本次入選商品
//             </h4>
//             <span className="text-xs text-muted-foreground">
//               每次重整隨機變換
//             </span>
//           </div>

//           {preview.selectedProducts.length === 0 ? (
//             <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
//               目前沒有任何上架中的產品，請先新增產品
//             </p>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//               {preview.selectedProducts.map((p, i) => (
//                 <div
//                   key={p.id}
//                   className="border rounded-lg p-3 space-y-1 hover:bg-accent/50 transition-colors"
//                 >
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">{["🥇", "🥈", "🥉"][i] || "🎁"}</span>
//                     <p className="font-medium text-sm truncate">{p.name}</p>
//                   </div>
//                   <p className="text-sm text-muted-foreground pl-8">
//                     💰 HK$ {p.price.toLocaleString("zh-HK")}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="bg-muted/50 rounded-md p-3">
//           <p className="text-xs text-muted-foreground">
//             💡 點擊「一鍵產生今日優惠」會立即產生或更新每日精選推廣，
//             並排程在明天早上 8:00 自動發布。
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
// src/components/admin/DailyPromotionSection.tsx
'use client'

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { generateDailyPromotion } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

type PreviewData = {
  date: string
  todayTitle: string
  holidays: string[]
  selectedProducts: {
    id: string
    name: string
    price: number
  }[]
}

export function DailyPromotionSection({ initialPreview }: { initialPreview: PreviewData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  // ✅ 直接使用 props，不要用 useState
  const preview = initialPreview

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        const result = await generateDailyPromotion()
        
        if (result.success) {
          toast.success("今日優惠已生成並發布！")
          router.refresh() // 刷新頁面，重新取得最新預覽
        } else {
          toast.error(result.error || "生成失敗")
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "生成失敗")
      }
    })
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">📢 每日精選優惠</CardTitle>
          <CardDescription>
            每日自動為您精選商品，組合成福袋推廣給客戶
          </CardDescription>
        </div>

        <Button 
          variant="default" 
          className="gap-2"
          onClick={handleGenerate}
          disabled={isPending}
        >
          <span>🎲</span>
          {isPending ? "生成中..." : "一鍵產生今日優惠"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">📰 今日主題</h4>
            <p className="text-base font-semibold">{preview.todayTitle}</p>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">📅 日期</h4>
            <p className="text-base">
              {new Date(preview.date).toLocaleDateString("zh-HK", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
          </div>
        </div>

        {preview.holidays.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">🌟 今日關注</h4>
            <ul className="list-disc list-inside text-sm space-y-0.5">
              {preview.holidays.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">
              🎯 本次入選商品
            </h4>
            <span className="text-xs text-muted-foreground">
              每次重整隨機變換
            </span>
          </div>

          {preview.selectedProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
              目前沒有任何上架中的產品，請先新增產品
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {preview.selectedProducts.map((p, i) => (
                <div
                  key={p.id}
                  className="border rounded-lg p-3 space-y-1 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{["🥇", "🥈", "🥉"][i] || "🎁"}</span>
                    <p className="font-medium text-sm truncate">{p.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground pl-8">
                    💰 HK$ {p.price.toLocaleString("zh-HK")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-muted/50 rounded-md p-3">
          <p className="text-xs text-muted-foreground">
            💡 點擊「一鍵產生今日優惠」會立即產生每日精選推廣，
            並直接發布推送给所有客戶。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
