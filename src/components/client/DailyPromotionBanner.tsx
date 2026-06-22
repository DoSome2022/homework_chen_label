// src/components/client/DailyPromotionBanner.tsx
'use client'

import Image from "next/image"
import { useState } from "react"
import { X } from "lucide-react"

type Props = {
  title: string
  content: string
  imageUrl: string | null
  publishedAt: Date | null
}

export function DailyPromotionBanner({ title, content, imageUrl, publishedAt }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  // 把 content 中的 **粗體** 和換行轉成 HTML（簡單處理）
  const formattedContent = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')

  return (
    <div className="relative mb-8 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 overflow-hidden">
      {/* 關閉按鈕 */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* 左邊：圖片 */}
        {imageUrl && (
          <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* 右邊：文字內容 */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-primary mb-2">
            {title}
          </h2>
          <div
            className="text-sm text-muted-foreground space-y-1"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />

          {publishedAt && (
            <p className="text-xs text-muted-foreground mt-3">
              🕐 {new Date(publishedAt).toLocaleDateString("zh-HK", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
