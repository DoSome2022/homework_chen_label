// src/components/admin/invoices/InvoicesClientPage.tsx
"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileDown,
  Search,
  CheckCircle2,
  XCircle,
  Send,                    // ✅ 新增
} from "lucide-react"
import { updateInvoiceStatus } from "@/lib/actions/invoice"
import { sendDocumentToCustomer, getAllCustomersForSending } from "@/lib/actions/send-document"  // ✅ 新增
import { SendToCustomerDialog } from "@/components/shared/SendToCustomerDialog"  // ✅ 新增
import { toast } from "sonner"


interface InvoiceData {
  id: string
  invoiceNumber: string
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"
  amount: number
  issuedDate: Date
  dueDate: Date | null
  paidDate: Date | null
  quote: {
    id: string
    project: {
      title: string
      customer: {
        name: string | null
        email: string | null
      }
    }
  }
}

interface Stats {
  total: number
  pending: number
  paid: number
  overdue: number
  cancelled: number
}

interface InvoicesClientPageProps {
  invoices: InvoiceData[]
  stats: Stats
  currentStatus?: string
  currentSearch?: string
}

const statusConfig = {
  PENDING: { label: "待付款", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  PAID: { label: "已付款", color: "bg-green-100 text-green-800 border-green-200" },
  OVERDUE: { label: "逾期", color: "bg-red-100 text-red-800 border-red-200" },
  CANCELLED: { label: "已作廢", color: "bg-gray-100 text-gray-800 border-gray-200" },
}

export function InvoicesClientPage({
  invoices,
  stats,
  currentStatus,
  currentSearch,
}: InvoicesClientPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch || "")

 // ✅ 新增：定義客戶型別
type CustomerOption = {
  id: string
  name: string | null
  email: string | null
  phoneOtps: { phone: string }[]
  customerContacts?: { phone?: string | null; email?: string | null } | null
}

  // ✅ 新增：發送對話框狀態
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [sendingInvoice, setSendingInvoice] = useState<InvoiceData | null>(null)
 const [customers, setCustomers] = useState<CustomerOption[]>([])


  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleStatusChange = (invoiceId: string, newStatus: "PAID" | "CANCELLED") => {
    const action = newStatus === "PAID" ? "標記為已付款" : "作廢"
    const confirmMsg = newStatus === "CANCELLED"
      ? "確定要作廢此發票？此操作無法復原。"
      : "確認此發票已收到款項？"

    if (!confirm(confirmMsg)) return

    startTransition(async () => {
      const result = await updateInvoiceStatus(invoiceId, newStatus)
      if (result.success) {
        toast.success(`發票已${action}`)
        router.refresh()
      } else {
        toast.error("操作失敗")
      }
    })
  }

  // ✅ 新增：開啟發送對話框
  const handleOpenSendDialog = async (invoice: InvoiceData) => {
    setSendingInvoice(invoice)
    try {
      const allCustomers = await getAllCustomersForSending()
      setCustomers(allCustomers)
      setSendDialogOpen(true)
    } catch  {
      toast.error("無法載入客戶資料")
    }
  }

  // ✅ 新增：發送 callback
  const handleSend = async (customerId: string, channels: string[]) => {
    if (!sendingInvoice) return { success: false, error: "沒有選取發票" }
    return sendDocumentToCustomer("INVOICE", sendingInvoice.id, customerId, channels)
  }

  const formatAmount = (amount: number) =>
    `$${amount.toLocaleString("zh-TW", { minimumFractionDigits: 2 })}`

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">發票管理</h1>
          <p className="text-sm text-muted-foreground">
            管理所有發票、標記收款與作廢
          </p>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="全部" value={stats.total} color="bg-blue-50 text-blue-700" />
        <StatCard label="待付款" value={stats.pending} color="bg-yellow-50 text-yellow-700" />
        <StatCard label="已付款" value={stats.paid} color="bg-green-50 text-green-700" />
        <StatCard label="逾期" value={stats.overdue} color="bg-red-50 text-red-700" />
        <StatCard label="已作廢" value={stats.cancelled} color="bg-gray-50 text-gray-700" />
      </div>

      {/* 過濾工具列 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋發票編號、專案、客戶..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateFilter("search", search)
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={currentStatus || "all"}
          onValueChange={(v) => updateFilter("status", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="全部狀態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部狀態</SelectItem>
            <SelectItem value="PENDING">待付款</SelectItem>
            <SelectItem value="PAID">已付款</SelectItem>
            <SelectItem value="OVERDUE">逾期</SelectItem>
            <SelectItem value="CANCELLED">已作廢</SelectItem>
          </SelectContent>
        </Select>

        {(currentStatus || currentSearch) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("")
              router.push(pathname)
            }}
          >
            清除過濾
          </Button>
        )}
      </div>

      {/* 發票表格 */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>發票編號</TableHead>
              <TableHead>開立日期</TableHead>
              <TableHead>到期日期</TableHead>
              <TableHead>專案名稱</TableHead>
              <TableHead>客戶</TableHead>
              <TableHead className="text-right">金額</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <FileDown className="h-8 w-8" />
                    目前沒有任何發票
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-mono font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(invoice.issuedDate)}
                  </TableCell>
                  <TableCell className={`text-sm ${
                    invoice.status === "OVERDUE" ? "text-red-600 font-medium" : "text-muted-foreground"
                  }`}>
                    {formatDate(invoice.dueDate)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {invoice.quote.project.title}
                  </TableCell>
                  <TableCell>
                    {invoice.quote.project.customer.name || "—"}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatAmount(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusConfig[invoice.status].color}
                    >
                      {statusConfig[invoice.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      {/* ✅ 新增：發送給客戶按鈕 */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                        onClick={() => handleOpenSendDialog(invoice)}
                        title="發送給客戶"
                      >
                        <Send className="h-4 w-4" />
                      </Button>

                      {/* 查看/列印 */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          window.open(`/admin/invoices/print/${invoice.id}`, "_blank")
                        }
                        title="查看/列印發票"
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>

                      {/* 標記已付款 */}
                      {invoice.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-800"
                          onClick={() => handleStatusChange(invoice.id, "PAID")}
                          disabled={isPending}
                          title="標記已付款"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}

                      {/* 作廢發票 */}
                      {invoice.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                          onClick={() => handleStatusChange(invoice.id, "CANCELLED")}
                          disabled={isPending}
                          title="作廢發票"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}

                      {/* 查看原始報價單 */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
                        onClick={() =>
                          window.open(`/admin/quotes/print/${invoice.quote.id}`, "_blank")
                        }
                        title="查看原始報價單"
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ 新增：發送對話框 */}
      <SendToCustomerDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        customers={customers}
        title="發送發票"
        documentType="INVOICE"
        documentId={sendingInvoice?.id || ""}
        documentTitle={sendingInvoice?.invoiceNumber || ""}
        onSend={handleSend}
      />
    </div>
  )
}

// 統計小卡片
function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className={`rounded-lg p-4 ${color} border`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
