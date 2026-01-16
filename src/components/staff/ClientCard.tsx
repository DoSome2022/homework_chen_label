'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// 1. 定義具體的資料介面，取代 any
interface ClientData {
  id: string
  name: string | null
  email: string | null
  projects: { id: string }[] // 只要知道它是陣列，用以計算長度
  conversations: {
    messages: {
      content: string
    }[]
  }[]
}

// 2. 移除未使用的 employeeId，並應用 ClientData 型別
interface ClientCardProps {
  client: ClientData
}

export function ClientCard({ client }: ClientCardProps) {
  // 3. 安全存取 (Optional Chaining)，防止陣列為空時報錯
  const latestMessage = client.conversations?.[0]?.messages?.[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {client.name || client.email}
          <Badge>潛力客</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          {/* 加入 ? 防止 projects 為 undefined */}
          <p className="text-sm font-medium">負責項目數：{client.projects?.length || 0}</p>
        </div>

        {latestMessage && (
          <div className="text-sm text-muted-foreground">
            最新訊息：{latestMessage.content.slice(0, 60)}...
          </div>
        )}

        <div className="flex gap-2">
          <Link href={`/dashboard/staff/${client.id}`} className="text-primary hover:underline">
            查看詳細資料
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
