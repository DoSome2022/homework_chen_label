// src/components/admin/BroadcastSendLogDialog.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface LogItem {
  id: string
  customerId: string
  customer: { name: string | null; email: string | null }
  channel: string
  status: string
  errorMessage: string | null
  sentAt: string | null
  createdAt: string
}

export function BroadcastSendLogDialog({ broadcastId }: { broadcastId: string }) {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const loadLogs = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/broadcasts/${broadcastId}/logs`)
        if (res.ok) {
          const data = await res.json()
          setLogs(data)
        }
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }

    loadLogs()
  }, [open, broadcastId])

  const channelLabel = { EMAIL: "Email", WHATSAPP: "WhatsApp" } as const
  const statusConfig = {
    SUCCESS: { label: "✅ 成功", color: "bg-green-100 text-green-700" },
    FAILED: { label: "❌ 失敗", color: "bg-red-100 text-red-700" },
    PENDING: { label: "⏳ 發送中", color: "bg-blue-100 text-blue-700" },
  } as const

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          title="查看發送明細"
        >
          <BarChart3 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📊 發送記錄明細</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            暫無發送記錄
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>客戶</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>通道</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>錯誤訊息</TableHead>
                <TableHead>發送時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.customer.name || "—"}</TableCell>
                  <TableCell className="text-sm">{log.customer.email || "—"}</TableCell>
                  <TableCell>
                    {channelLabel[log.channel as keyof typeof channelLabel] || log.channel}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusConfig[log.status as keyof typeof statusConfig]?.color}
                    >
                      {statusConfig[log.status as keyof typeof statusConfig]?.label || log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {log.errorMessage || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.sentAt
                      ? new Date(log.sentAt).toLocaleString("zh-TW")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  )
}
