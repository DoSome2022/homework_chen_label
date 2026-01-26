// src/components/client/MessageInput.tsx
'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ImageUploader } from "@/components/shared/ImageUploader"
import { sendCustomerMessage } from "@/lib/actions/client"

export function MessageInput({ conversationId }: { conversationId: string }) {
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // 直接接收 ImageUploader 回傳的 URL 陣列（通常只取最後一張）
  const handleImageChange = (urls: string[]) => {
    // 只保留最後一張圖片（符合單一訊息單張圖的常見需求）
    const latestUrl = urls[urls.length - 1] || null
    setImageUrl(latestUrl)
  }

  const handleSend = async () => {
    // 至少要有文字或圖片才能送出
    if (!content.trim() && !imageUrl) return

    const formData = new FormData()
    formData.append("conversationId", conversationId)
    if (content.trim()) formData.append("content", content.trim())
    if (imageUrl) formData.append("imageUrl", imageUrl)

    try {
      await sendCustomerMessage(formData)
      // 清空表單
      setContent("")
      setImageUrl(null)
    } catch (err) {
      console.error("發送訊息失敗", err)
      alert("發送失敗，請稍後再試")
    }
  }

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex items-end gap-2">
        <ImageUploader
          value={imageUrl ? [imageUrl] : []}
          onChange={handleImageChange}           // ← 型別正確
          onRemove={() => setImageUrl(null)}
        />

        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={imageUrl ? "可為圖片加說明文字（選填）" : "輸入訊息..."}
          className="flex-1"
        />

        <Button
          onClick={handleSend}
          disabled={!content.trim() && !imageUrl}
        >
          送出
        </Button>
      </div>
    </div>
  )
}