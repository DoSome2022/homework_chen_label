// src/components/staff/StaffMessageInput.tsx
'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { sendStaffMessage, sendQuoteInConversation, updateProjectProgress } from "@/lib/actions/staff-message"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, TrendingUp } from "lucide-react"
import { FileUploader } from "../shared/ImageUploader"

interface StaffMessageInputProps {
  conversationId: string
  projectId: string
}

export function StaffMessageInput({ conversationId, projectId }: StaffMessageInputProps) {
  const [content, setContent] = useState("")
  const [attachments, setAttachments] = useState<{ url: string; name: string; type: string }[]>([])
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false)
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)

  // ── 發送一般訊息 ──
  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) return

    const formData = new FormData()
    formData.append("conversationId", conversationId)
    if (content.trim()) formData.append("content", content.trim())

    // 只傳第一個附件（簡化設計）
    if (attachments.length > 0) {
      formData.append("fileUrl", attachments[0].url)
      formData.append("fileName", attachments[0].name)
      formData.append("fileType", attachments[0].type)
    }

    try {
      await sendStaffMessage(formData)
      setContent("")
      setAttachments([])
    } catch (err) {
      console.error("發送失敗", err)
      alert("發送失敗")
    }
  }

  // ── 發送報價單 ──
  const handleSendQuote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append("conversationId", conversationId)

    try {
      await sendQuoteInConversation(formData)
      setQuoteDialogOpen(false)
    } catch (err) {
      console.error("報價失敗", err)
      alert("報價失敗")
    }
  }

  // ── 更新進度 ──
  const handleUpdateProgress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append("conversationId", conversationId)
    formData.append("projectId", projectId)

    try {
      await updateProjectProgress(formData)
      setProgressDialogOpen(false)
    } catch (err) {
      console.error("更新進度失敗", err)
      alert("更新失敗")
    }
  }

  return (
    <div className="space-y-3">
      {/* 快捷操作按鈕 */}
      <div className="flex items-center gap-2">
        {/* 開報價單 */}
        <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <FileText className="h-4 w-4" />
              開報價單
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>建立報價單</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSendQuote} className="space-y-4">
              <div>
                <Label>金額 (HK$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  name="amount"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>說明（選填）</Label>
                <Textarea name="details" placeholder="報價內容說明..." />
              </div>
              <Button type="submit" className="w-full">
                送出報價單
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* 更新進度 */}
        <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <TrendingUp className="h-4 w-4" />
              更新進度
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>更新專案進度</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateProgress} className="space-y-4">
              <div>
                <Label>目前階段 *</Label>
                <Input
                  name="stage"
                  required
                  placeholder="例如：已報價、生產中、已出貨..."
                  list="stage-suggestions"
                />
                <datalist id="stage-suggestions">
                  <option value="已報價" />
                  <option value="確認中" />
                  <option value="生產中" />
                  <option value="已出貨" />
                  <option value="已完成" />
                  <option value="已取消" />
                </datalist>
              </div>
              <div>
                <Label>備註（選填）</Label>
                <Textarea name="description" placeholder="補充說明..." />
              </div>
              <Button type="submit" className="w-full">
                更新進度
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 輸入區域 */}
      <div className="flex items-end gap-2">
        <FileUploader
          value={attachments}
          onChange={setAttachments}
          onRemove={(url) => setAttachments(prev => prev.filter(f => f.url !== url))}
        />

        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            attachments.length > 0
              ? "可為附件加說明文字（選填）..."
              : "輸入訊息..."
          }
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
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
