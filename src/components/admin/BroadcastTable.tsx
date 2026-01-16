// src/components/admin/BroadcastTable.tsx
'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { deleteBroadcast } from "@/lib/actions/admin-broadcast"
import { Trash2 } from "lucide-react"
import Image from "next/image"
import { EditBroadcastDialog } from "./EditBroadcastDialog"
import { Broadcast } from "@prisma/client"

// 定義正確的型別：包含 author 關聯
type BroadcastWithAuthor = Broadcast & {
  author: { name: string | null } | null
}

export function BroadcastTable({ broadcasts }: { broadcasts: BroadcastWithAuthor[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>標題</TableHead>
          <TableHead>圖片預覽</TableHead>
          <TableHead>內容摘要</TableHead>
          <TableHead>作者</TableHead>
          <TableHead>建立日期</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {broadcasts.map((broadcast) => (
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
            <TableCell>{broadcast.author?.name || "未知"}</TableCell>
            <TableCell>{new Date(broadcast.createdAt).toLocaleDateString("zh-TW")}</TableCell>
            <TableCell className="text-right space-x-2">
              <EditBroadcastDialog broadcast={broadcast} />
              <form action={deleteBroadcast.bind(null, broadcast.id)} className="inline">
                <Button type="submit" variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}