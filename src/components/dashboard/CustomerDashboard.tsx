'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { applyForBroadcast, toggleBroadcastSubscription } from "@/lib/actions/client"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner" // 假設你使用 sonner 顯示通知

// 定義類型
interface Broadcast {
  id: string
  title: string
  content: string
  imageUrl: string | null
  videoUrl: string | null
  scheduledAt: Date | null
  createdAt: Date
  author: {
    name: string | null
  }
}

interface CustomerDashboardProps {
  initialData: {
    myApplicationsCount: number
    latestPublishedCount: number
    allPublishedBroadcasts: Broadcast[]
    isSubscribed: boolean
  }
}

export function CustomerDashboard({ initialData }: CustomerDashboardProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialData.isSubscribed)
  // const [allPublishedBroadcasts, setAllPublishedBroadcasts] = useState<Broadcast[]>(initialData.allPublishedBroadcasts)
  const [loading, setLoading] = useState(false)
  // const [latestPublishedCount, setLatestPublishedCount] = useState(initialData.latestPublishedCount)
  const allPublishedBroadcasts = initialData.allPublishedBroadcasts;
  const latestPublishedCount = initialData.latestPublishedCount;
  const handleToggleSubscription = async () => {
    try {
      setLoading(true)
      await toggleBroadcastSubscription()
      
      // 更新訂閱狀態
      const newIsSubscribed = !isSubscribed
      setIsSubscribed(newIsSubscribed)
      
      // 如果從未訂閱變成訂閱，重新獲取廣播列表
      if (newIsSubscribed && allPublishedBroadcasts.length === 0) {
        // 這裡簡單重整頁面來獲取最新數據，或者你可以選擇實作 fetch API 來局部更新
        window.location.reload()
      }
      
    } catch (error) {
      console.error("切換訂閱失敗:", error)
      alert("訂閱操作失敗，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  // 格式化日期時間
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // --- 新增：YouTube 網址轉換函數 ---
function getYouTubeEmbedUrl(url: string) {
  if (!url) return '';
  // 匹配常見的 YouTube 網址格式
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  // 如果成功抓到 ID (11個字元)，返回嵌入網址
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  // 為了避免錯誤，如果轉換失敗但看起來像網址，還是回傳原值(雖然可能無法顯示)
  // 或者是可以回傳 null 讓 UI 顯示錯誤狀態
  return url;
}
// --------------------------------

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">我的儀表板</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <CardMetric 
          title="我的申請" 
          value={initialData.myApplicationsCount.toString()} 
        />
        
        <CardMetric 
          title="最新廣播" 
          value={`${latestPublishedCount} 則`} 
        />

        {/* 訂閱按鈕 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              廣播訂閱
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold">
              {isSubscribed ? "已訂閱" : "未訂閱"}
            </div>
            <Button
              onClick={handleToggleSubscription}
              disabled={loading}
              variant={isSubscribed ? "outline" : "default"}
              className={isSubscribed ? "hover:bg-red-50 hover:text-red-600" : ""}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  處理中...
                </span>
              ) : isSubscribed ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  取消訂閱
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  訂閱
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 已訂閱才顯示已發布的廣播列表 */}
      {isSubscribed ? (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">所有廣播內容</h2>
            <div className="text-sm text-muted-foreground">
              共 {allPublishedBroadcasts.length} 則廣播
            </div>
          </div>
          
          <div className="grid gap-6">
            {allPublishedBroadcasts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">目前無已發布的廣播內容</h3>
                <p className="mt-1 text-sm text-gray-500">管理員尚未發布任何廣播。</p>
              </div>
            ) : (
              allPublishedBroadcasts.map((broadcast) => (
                <Card key={broadcast.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white relative">

                          {/* --- 新增：右上角申請按鈕 --- */}
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs h-8 border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={async () => {
                        if (!confirm("確定要針對此廣播內容提出合作申請嗎？")) return;
                        try {
                          await applyForBroadcast(broadcast.id);
                          toast.success("申請已送出，請等待人員聯繫");
                        } catch (error) {                      // ✅ 移除 :any
                          const message = error instanceof Error ? error.message : "申請失敗"
                          toast.error(message);
                        }
                      }}
                    >
                      申請合作
                    </Button>
                  </div>
                  {/* ------------------------ */}
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{broadcast.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {broadcast.author.name || "系統"}
                          </span>
                          <span>•</span>
                          
                          {/* 修正部分 1: 發布時間 */}
                          <span className="inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            發布於&nbsp;
                            <span suppressHydrationWarning>
                                {formatDateTime(broadcast.createdAt)}
                            </span>
                          </span>

                          {broadcast.scheduledAt && (
                            <>
                              <span>•</span>
                              {/* 修正部分 2: 排程時間 */}
                              <span className="inline-flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                排程發布&nbsp;
                                <span suppressHydrationWarning>
                                    {formatDateTime(broadcast.scheduledAt)}
                                </span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6">
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {broadcast.content}
                      </p>
                    </div>
                    
                    {/* 圖片 */}
                    {broadcast.imageUrl && (
                      <div className="mt-6">
                        <div className="text-sm font-medium text-gray-500 mb-2">圖片附件</div>
                        <div className="relative rounded-lg overflow-hidden border">
                          <Image
                            src={broadcast.imageUrl}
                            alt={broadcast.title}
                            width={800}
                            height={450}
                            className="w-full h-auto object-contain max-h-[500px]"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* 影片 */}
                    {broadcast.videoUrl && (
                      <div className="mt-6">
                        <div className="text-sm font-medium text-gray-500 mb-2">影片附件</div>
                        <div className="relative rounded-lg overflow-hidden border bg-black">
                          <iframe
                            width="100%"
                            height="400"
                            src={getYouTubeEmbedUrl(broadcast.videoUrl || "")} // ✅ 這裡加上轉換函數
                            title={`廣播影片 - ${broadcast.title}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="border-0"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* 操作按鈕 */}
                    <div className="flex items-center justify-between mt-6 pt-6 border-t">
                      <div className="text-sm text-gray-500">
                        <span className="inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          廣播內容
                        </span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // 可以添加分享功能
                          if (navigator.share) {
                            navigator.share({
                              title: broadcast.title,
                              text: broadcast.content.substring(0, 100),
                              url: window.location.href,
                            })
                          } else {
                            // 複製連結
                            navigator.clipboard.writeText(window.location.href)
                            alert("連結已複製到剪貼簿")
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        分享
                      </Button>
                                            <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-800 hover:bg-green-50"
                        onClick={() => {
                          const shareText = `${broadcast.title}\n\n${broadcast.content.substring(0, 200)}${broadcast.content.length > 200 ? '...' : ''}\n\n查看詳情：${window.location.href}`
                          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">尚未訂閱廣播</h3>
            <p className="mt-2 text-sm text-gray-500">
              訂閱廣播後即可查看所有已發布的內容，包含最新公告、產品資訊和重要通知。
            </p>
            <div className="mt-6">
              <Button
                onClick={handleToggleSubscription}
                disabled={loading}
                className="px-6"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    處理中...
                  </>
                ) : (
                  "立即訂閱廣播"
                )}
              </Button>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              隨時可以取消訂閱，訂閱後將即時收到最新通知
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// CardMetric 組件
function CardMetric({ title, value }: { title: string; value: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {title === "我的申請" ? "累計申請數量" : 
           title === "最新廣播" ? "最近7天內發布" : 
           "訂閱狀態"}
        </div>
      </CardContent>
    </Card>
  )
}

