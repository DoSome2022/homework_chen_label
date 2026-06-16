// src/components/admin/quotes/QuotesClientPage.tsx
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Trash2, 
  FileDown, 
  Plus, 
  Edit, 
  Search,
  Receipt,
  Send,                    // ✅ 新增
} from "lucide-react"
import { deleteQuote } from "@/lib/actions/quote"
import { convertQuoteToInvoice } from "@/lib/actions/invoice"
import { sendDocumentToCustomer, getAllCustomersForSending } from "@/lib/actions/send-document"  // ✅ 新增
import { SendToCustomerDialog } from "@/components/shared/SendToCustomerDialog"  // ✅ 新增
import { toast } from "sonner"
import { QuoteForm } from "./QuoteForm"

interface ProjectOption {
  id: string;
  title: string;
}

interface QuoteData {
  id: string;
  createdAt: Date;
  projectId: string;
  project: {
    id: string;
    title: string;
    customer: {
      name: string | null;
    };
  };
  amount: number;
  details: string | null;
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
  } | null;
}

interface QuotesClientPageProps {
  initialQuotes: QuoteData[];
  projects: ProjectOption[];
}

// ✅ 新增：編輯用資料型別
type EditQuoteData = {
  id: string;
  projectId: string;
  amount: number;
  details: string | null;
}
// ✅ 新增：客戶型別（匹配 SendToCustomerDialog 的 Customer 介面）
type CustomerOption = {
  id: string
  name: string | null
  email: string | null
  phoneOtps: { phone: string }[]
  customerContacts?: { phone?: string | null; email?: string | null } | null
}

export function QuotesClientPage({ initialQuotes, projects }: QuotesClientPageProps) {
  const [quotes, setQuotes] = useState<QuoteData[]>(initialQuotes)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
const [editingQuote, setEditingQuote] = useState<EditQuoteData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // ✅ 新增：發送對話框狀態
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [sendingQuote, setSendingQuote] = useState<QuoteData | null>(null)
  const [customers, setCustomers] = useState<CustomerOption[]>([])

  // 1. 刪除邏輯
  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ 確定要永久刪除此報價單嗎？此操作無法復原。")) return
    
    try {
      await deleteQuote(id)
      setQuotes(quotes.filter(q => q.id !== id))
      toast.success("報價單已成功刪除")
    } catch (error) {
      const message = error instanceof Error ? error.message : "刪除失敗"
      console.error("Delete error:", message)
      toast.error(message)
    }
  }

  // 2. 編輯邏輯
  const handleEdit = (quote: QuoteData) => {
    const editData: EditQuoteData = {                     // ✅ 明確型別
      id: quote.id,
      projectId: quote.project.id,
      amount: quote.amount,
      details: quote.details,
    }
    setEditingQuote(editData)                             // ✅ 不再需要 as any
    setIsDialogOpen(true)
  }

  // 3. 列印邏輯
  const handlePrint = (quote: QuoteData) => {
    window.location.href = `/admin/quotes/print/${quote.id}`
  }

  // 4. 轉為發票邏輯
  const handleConvertToInvoice = async (quote: QuoteData) => {
    if (!confirm(`將報價單「${quote.project.title}」轉為發票？\n轉換後將產生發票編號。`)) return

    try {
      const result = await convertQuoteToInvoice(quote.id)
      
      if (result.error) {
        if (result.invoiceId) {
          if (confirm(`${result.error}\n是否查看發票？`)) {
            window.open(`/admin/invoices/print/${result.invoiceId}`, "_blank")
          }
        } else {
          toast.error(result.error)
        }
      } else if (result.invoice) {
        toast.success(`✅ 發票已建立：${result.invoice.invoiceNumber}`)
        if (confirm("發票已建立！是否立即查看？")) {
          window.open(`/admin/invoices/print/${result.invoice.id}`, "_blank")
        }
      }
    } catch (error) {                                     // ✅ 移除 :any
      const message = error instanceof Error ? error.message : "轉換失敗"
      toast.error(message)
    }
  }

  // ✅ 5. 新增：開啟發送對話框
  const handleOpenSendDialog = async (quote: QuoteData) => {
    setSendingQuote(quote)
    try {
      const allCustomers = await getAllCustomersForSending()
      setCustomers(allCustomers)
      setSendDialogOpen(true)
    } catch {                                             // ✅ 移除未使用的 err
      toast.error("無法載入客戶資料")
    }
  }

  // ✅ 6. 新增：發送 callback
  const handleSend = async (customerId: string, channels: string[]) => {
    if (!sendingQuote) return { success: false, error: "沒有選取報價單" }
    return sendDocumentToCustomer("QUOTE", sendingQuote.id, customerId, channels)
  }

  // 7. 搜尋邏輯
  const filteredQuotes = quotes.filter(quote => {
    const projectTitle = quote.project.title.toLowerCase();
    const customerName = (quote.project.customer.name ?? "").toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    return projectTitle.includes(searchTermLower) || 
           customerName.includes(searchTermLower);
  });

  return (
    <div className="space-y-6">
      {/* 標題與操作區 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">報價單管理</h2>
          <p className="text-sm text-muted-foreground">管理所有專案的報價單與金額調整</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜尋專案或客戶"
              className="pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingQuote(null)
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" /> 新增報價單
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingQuote ? "📝 編輯報價單內容" : "➕ 建立新報價單"}
                </DialogTitle>
              </DialogHeader>

              <QuoteForm 
                projects={projects} 
                initialData={editingQuote} 
                onSuccess={() => {
                  setIsDialogOpen(false)
                  setEditingQuote(null)
                  toast.success(editingQuote ? "更新成功" : "建立成功")
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
  
        {editingQuote && (
          <Button variant="outline" onClick={() => {
            setEditingQuote(null);
            setIsDialogOpen(false);
          }}>
            取消編輯
          </Button>
        )}
      </div>

      {/* 數據表格 */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[150px]">日期</TableHead>
              <TableHead>專案名稱</TableHead>
              <TableHead>客戶名稱</TableHead>
              <TableHead className="text-right">金額 </TableHead>
              <TableHead className="text-center">發票狀態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.length > 0 ? (
              filteredQuotes.map((quote) => (
                <TableRow key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="text-muted-foreground">
                    {new Date(quote.createdAt).toLocaleDateString("zh-TW")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {quote.project.title}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {quote.project.customer.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-blue-600">
                    ${quote.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>

                  {/* 發票狀態 */}
                  <TableCell className="text-center">
                    {quote.invoice ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${quote.invoice.status === "PAID" ? "bg-green-100 text-green-700" :
                          quote.invoice.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                          quote.invoice.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"}`}
                      >
                        {quote.invoice.status === "PAID" && "✅ 已付款"}
                        {quote.invoice.status === "PENDING" && "📄 待付款"}
                        {quote.invoice.status === "OVERDUE" && "⚠️ 逾期"}
                        {quote.invoice.status === "CANCELLED" && "🚫 作廢"}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* 編輯 */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600"
                        onClick={() => handleEdit(quote)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* ✅ 新增：發送給客戶按鈕 */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                        onClick={() => handleOpenSendDialog(quote)}
                        title="發送給客戶"
                      >
                        <Send className="h-4 w-4" />
                      </Button>

                      {/* 轉為發票按鈕 */}
                      {quote.invoice ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-800"
                          onClick={() => window.open(`/admin/invoices/print/${quote.invoice!.id}`, "_blank")}
                          title="查看發票"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-purple-600 hover:text-purple-800"
                          onClick={() => handleConvertToInvoice(quote)}
                          title="轉為發票"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}

                      {/* 列印 */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-gray-600 hover:text-green-600"
                        onClick={() => handlePrint(quote)}
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>

                      {/* 刪除 */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(quote.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  找不到相關報價單
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ 新增：發送對話框 */}
      <SendToCustomerDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        customers={customers}
        title="發送報價單"
        documentType="QUOTE"
        documentId={sendingQuote?.id || ""}
        documentTitle={sendingQuote?.project.title || ""}
        onSend={handleSend}
      />
    </div>
  )
}
