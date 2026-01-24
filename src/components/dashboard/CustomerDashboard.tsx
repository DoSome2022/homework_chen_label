'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toggleBroadcastSubscription } from "@/lib/actions/client"
import Image from "next/image"
import { useState } from "react"

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
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
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
                            src={broadcast.videoUrl}
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
