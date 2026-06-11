// src/components/client/MessageInput.tsx
'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { sendCustomerMessage } from "@/lib/actions/client"
import { FileUploader } from "../shared/ImageUploader"


export function MessageInput({ conversationId }: { conversationId: string }) {
  const [content, setContent] = useState("")
  // ⭐ 改為陣列物件格式
  const [attachments, setAttachments] = useState<{ url: string; name: string; type: string }[]>([])

  // 直接接收 FileUploader 回傳的檔案陣列
  const handleFileChange = (files: { url: string; name: string; type: string }[]) => {
    setAttachments(files)
  }

  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) return

    const formData = new FormData()
    formData.append("conversationId", conversationId)
    if (content.trim()) formData.append("content", content.trim())

    // 只傳第一個附件
    if (attachments.length > 0) {
      formData.append("imageUrl", attachments[0].url)
    }

    try {
      await sendCustomerMessage(formData)
      setContent("")
      setAttachments([])
    } catch (err) {
      console.error("發送訊息失敗", err)
      alert("發送失敗，請稍後再試")
    }
  }

  // 取最新的附件來顯示佔位文字
  // const latestAttachment = attachments[attachments.length - 1]

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex items-end gap-2">
        <FileUploader
          value={attachments}
          onChange={handleFileChange}
          onRemove={(url) => setAttachments(prev => prev.filter(f => f.url !== url))}
        />

        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            attachments.length > 0
              ? "可為附件加說明文字（選填）"
              : "輸入訊息..."
          }
          className="flex-1"
        />

        <Button
          onClick={handleSend}
          disabled={!content.trim() && attachments.length === 0}
        >
          送出
        </Button>
      </div>
    </div>
  )
}
