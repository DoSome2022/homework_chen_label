'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EditReportDialog } from "./EditReportDialog"
import { Trash2 } from "lucide-react"
import { deleteReport } from "@/lib/actions/admin-report"
import { Report } from "@prisma/client"  // 導入原始 Prisma Report 型別

// 自訂帶關聯的 Report 型別：繼承原始 Report，並加入 author / project 物件
interface ReportWithRelations extends Report {
  author: {
    name: string | null
    role: string
  }
  project: {
    title: string | null
  } | null
}

const typeLabel: Record<string, string> = {
  SALES: "銷售",
  PRODUCT: "產品",
  AMOUNT: "金額",
  BROADCAST: "廣播/廣告",
  EMPLOYEE: "員工",
}

export function ReportTable({ reports }: { reports: ReportWithRelations[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>標題</TableHead>
          <TableHead>類型</TableHead>
          <TableHead>作者</TableHead>
          <TableHead>關聯項目</TableHead>
          <TableHead>建立日期</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell className="font-medium max-w-xs truncate">{report.title}</TableCell>
            <TableCell>
              <Badge>{typeLabel[report.type]}</Badge>
            </TableCell>
            <TableCell>
              {report.author.name || "未知"} ({report.author.role === "ADMIN" ? "管理員" : "員工"})
            </TableCell>
            <TableCell>{report.project?.title || "-"}</TableCell>
            <TableCell>{new Date(report.createdAt).toLocaleDateString("zh-TW")}</TableCell>
            <TableCell className="text-right space-x-2">
              <EditReportDialog report={report} />
              <form className="inline" action={deleteReport.bind(null, report.id)}>
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