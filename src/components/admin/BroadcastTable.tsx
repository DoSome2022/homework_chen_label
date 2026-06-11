// src/components/admin/BroadcastTable.tsx
'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { deleteBroadcast, publishBroadcast, pauseBroadcast, resumeBroadcast, archiveBroadcast } from "@/lib/actions/admin-broadcast"
import { Trash2, Play, Pause, Archive} from "lucide-react"
import Image from "next/image"
import { EditBroadcastDialog } from "./EditBroadcastDialog"
import { Broadcast } from "@prisma/client"
import { toast } from "sonner"
import {  useTransition } from "react"
import { BroadcastSendLogDialog } from "./BroadcastSendLogDialog"
import { togglePinBroadcast } from "@/lib/actions/admin-broadcast"
import { Pin, PinOff } from "lucide-react"

  // ✅ 新增

type BroadcastWithAuthorAndLogs = Broadcast & {
  author: { name: string | null } | null
  _count?: {
    broadcastLogs?: number
  }
  broadcastLogs?: {
    channel: string
    status: string
  }[]
}

// 狀態設定
const statusConfig = {
  DRAFT: { label: "草稿", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  PUBLISHED: { label: "已發布", color: "bg-green-100 text-green-800 border-green-200" },
  PAUSED: { label: "已暫停", color: "bg-orange-100 text-orange-800 border-orange-200" },
  ARCHIVED: { label: "已封存", color: "bg-gray-100 text-gray-800 border-gray-200" },
}

// ✅ 發送狀態設定
const sendStatusConfig = {
  pending: { label: "發送中...", color: "bg-blue-100 text-blue-700" },
  partial: { label: "部分成功", color: "bg-yellow-100 text-yellow-700" },
  success: { label: "全部成功", color: "bg-green-100 text-green-700" },
  failed: { label: "全部失敗", color: "bg-red-100 text-red-700" },
  none: { label: "—", color: "bg-gray-100 text-gray-400" },
}

export function BroadcastTable({ broadcasts }: { broadcasts: BroadcastWithAuthorAndLogs[] }) {
  const [isPending, startTransition] = useTransition()

const handleAction = async (action: string, id: string) => {
  startTransition(async () => {
    try {
      switch (action) {
        case "publish":
          await publishBroadcast(id)
          toast.success("已發布，正在發送通知...")
          break
        case "pause":
          await pauseBroadcast(id)
          toast.success("已暫停推送")
          break
        case "resume":
          await resumeBroadcast(id)
          toast.success("已恢復推送")
          break
        case "archive":
          if (!confirm("確定要封存此廣播？")) return
          await archiveBroadcast(id)
          toast.success("已封存")
          break
        // ⭐ 新增
        case "togglePin":
          await togglePinBroadcast(id)
          toast.success("已更新顯示狀態")
          break
      }
    } catch {
      toast.error("操作失敗")
    }
  })
}

  // ✅ 計算發送統計
  const getSendStats = (broadcast: BroadcastWithAuthorAndLogs) => {
    const logs = broadcast.broadcastLogs
    if (!logs || logs.length === 0) {
      return { total: 0, success: 0, failed: 0, pending: 0 }
    }

    const success = logs.filter(l => l.status === "SUCCESS").length
    const failed = logs.filter(l => l.status === "FAILED").length
    const pending = logs.filter(l => l.status === "PENDING").length

    return { total: logs.length, success, failed, pending }
  }

  // ✅ 取得發送狀態徽章
  const getSendStatusBadge = (broadcast: BroadcastWithAuthorAndLogs) => {
    // 非發布狀態不顯示發送狀態
    if (broadcast.status !== "PUBLISHED") {
      return (
        <span className="text-xs text-muted-foreground">—</span>
      )
    }

    const stats = getSendStats(broadcast)

    // 還沒有發送記錄
    if (stats.total === 0) {
      return (
        <Badge variant="outline" className={sendStatusConfig.none.color}>
          排程中
        </Badge>
      )
    }

    // 全部成功
    if (stats.failed === 0 && stats.pending === 0) {
      return (
        <Badge variant="outline" className={sendStatusConfig.success.color}>
          ✅ {stats.total}/{stats.total}
        </Badge>
      )
    }

    // 全部失敗
    if (stats.success === 0 && stats.pending === 0) {
      return (
        <Badge variant="outline" className={sendStatusConfig.failed.color}>
          ❌ 全部失敗
        </Badge>
      )
    }

    // 部分成功
    if (stats.success > 0 && stats.failed > 0 && stats.pending === 0) {
      return (
        <Badge variant="outline" className={sendStatusConfig.partial.color}>
          ⚠️ {stats.success}/{stats.total}
        </Badge>
      )
    }

    // 還有發送中的
    if (stats.pending > 0) {
      return (
        <Badge variant="outline" className={sendStatusConfig.pending.color}>
          ⏳ {stats.success}/{stats.total}
        </Badge>
      )
    }

    return (
      <span className="text-xs text-muted-foreground">—</span>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>標題</TableHead>
          <TableHead>圖片預覽</TableHead>
          <TableHead>內容摘要</TableHead>
          <TableHead>狀態</TableHead>
          <TableHead>發送狀態</TableHead>         
          <TableHead>排程時間</TableHead>
          <TableHead>作者</TableHead>
          <TableHead>建立日期</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {broadcasts.map((broadcast) => {
          const stats = getSendStats(broadcast)  

          return (
            <TableRow key={broadcast.id}>
              <TableCell className="font-medium">{broadcast.title}</TableCell>
              <TableCell>
                {broadcast.imageUrl ? (
                  <Image
                    src={broadcast.imageUrl}
                    alt="preview"
                    width={80}
                    height={80}
                    className="rounded object-cover"
                  />
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="max-w-xs truncate">{broadcast.content}</TableCell>

              {/* 狀態 */}
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusConfig[broadcast.status as keyof typeof statusConfig]?.color || "bg-gray-100"}
                >
                  {statusConfig[broadcast.status as keyof typeof statusConfig]?.label || broadcast.status}
                </Badge>
              </TableCell>

              {/* ✅ 發送狀態 */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {getSendStatusBadge(broadcast)}
                  
                  {/* ✅ 有發送記錄時，顯示明細按鈕 */}
                  {broadcast.status === "PUBLISHED" && stats.total > 0 && (
                    <BroadcastSendLogDialog broadcastId={broadcast.id} />
                  )}
                </div>
              </TableCell>

              {/* 排程時間 */}
              <TableCell className="text-sm text-muted-foreground">
                {broadcast.scheduledAt
                  ? new Date(broadcast.scheduledAt).toLocaleString("zh-TW")
                  : "立即"}
              </TableCell>

              <TableCell>{broadcast.author?.name || "未知"}</TableCell>
              <TableCell>{new Date(broadcast.createdAt).toLocaleDateString("zh-TW")}</TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {/* 狀態操作按鈕 */}
                  {broadcast.status === "DRAFT" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-800"
                      onClick={() => handleAction("publish", broadcast.id)}
                      disabled={isPending}
                      title="發布（將發送 Email + WhatsApp）"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}

                  {broadcast.status === "PUBLISHED" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-orange-600 hover:text-orange-800"
                        onClick={() => handleAction("pause", broadcast.id)}
                        disabled={isPending}
                        title="暫停推送"
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
                        onClick={() => handleAction("archive", broadcast.id)}
                        disabled={isPending}
                        title="封存"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {broadcast.status === "PAUSED" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-800"
                        onClick={() => handleAction("resume", broadcast.id)}
                        disabled={isPending}
                        title="恢復推送"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
                        onClick={() => handleAction("archive", broadcast.id)}
                        disabled={isPending}
                        title="封存"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* 編輯按鈕（非封存狀態） */}
                  {broadcast.status !== "ARCHIVED" && (
                    <EditBroadcastDialog broadcast={broadcast} />
                  )}

                  {/* ⭐ 置頂按鈕 */}
<Button
  variant="ghost"
  size="sm"
  className={`h-8 w-8 p-0 ${
    broadcast.isPinned 
      ? 'text-yellow-500 hover:text-yellow-700' 
      : 'text-gray-400 hover:text-gray-600'
  }`}
  onClick={() => handleAction("togglePin", broadcast.id)}
  disabled={isPending}
  title={broadcast.isPinned ? "取消在客戶端顯示" : "在客戶端顯示此廣播"}
>
  {broadcast.isPinned ? (
    <Pin className="h-4 w-4 fill-current" />
  ) : (
    <PinOff className="h-4 w-4" />
  )}
</Button>

                  {/* 刪除按鈕（只有草稿和封存可刪） */}
                  {(broadcast.status === "DRAFT" || broadcast.status === "ARCHIVED") && (
                    <form action={deleteBroadcast.bind(null, broadcast.id)} className="inline">
                      <Button type="submit" variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
