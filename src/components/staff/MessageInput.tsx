'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ImageUploader } from "@/components/shared/ImageUploader"
import { sendCustomerMessage } from "@/lib/actions/client"

export function MessageInput({ conversationId }: { conversationId: string }) {
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleSend = async () => {
    if (!content.trim() && !imageUrl) return

    const formData = new FormData()
    formData.append("conversationId", conversationId)
    if (content.trim()) formData.append("content", content.trim())
    if (imageUrl) formData.append("imageUrl", imageUrl)  // 傳送圖片 URL

    await sendCustomerMessage(formData)

    // 重置表單
    setContent("")
    setImageUrl(null)
  }

  return (
    <div className="flex items-end gap-2 mt-4">
      {/* 使用 onChange 取得最新上傳的圖片 URL */}
      <ImageUploader
        value={imageUrl ? [imageUrl] : []}                    // 顯示目前一張圖片
        onChange={(urls) => {
          // 只取最後一張（因為訊息通常只附一張）
          const latestUrl = urls[urls.length - 1]
          setImageUrl(latestUrl || null)
        }}
        onRemove={() => setImageUrl(null)}                    // 移除圖片時清空狀態
      />

      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="輸入訊息..."
        className="flex-1"
      />

      <Button 
        onClick={handleSend} 
        disabled={!content.trim() && !imageUrl}
      >
        送出
      </Button>
    </div>
  )
}