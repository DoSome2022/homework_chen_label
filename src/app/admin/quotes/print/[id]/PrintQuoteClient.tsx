// src/app/admin/quotes/print/[id]/PrintQuoteClient.tsx
"use client"

import { useEffect, useState, useTransition } from "react"   // ✅ 加入 useState, useTransition
import { useRouter } from "next/navigation"            // ✅
import { toast } from "sonner"                                // ✅
import { convertQuoteToInvoice } from "@/lib/actions/invoice" // ✅

interface QuoteData {
  id: string
  createdAt: Date
  projectId: string
  project: {
    id: string
    title: string
    description: string | null
    customer: {
      name: string | null
      email: string | null
    }
  }
  amount: number
  details: string | null
  invoice?: {
    id: string
    invoiceNumber: string
    status: string
  } | null
}

export function PrintQuoteClient({ quote }: { quote: QuoteData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()       // ✅
  const [invoice, setInvoice] = useState(quote.invoice)      // ✅

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print()
    }, 500)

    const handleAfterPrint = () => {
      router.back()
    }
    window.addEventListener("afterprint", handleAfterPrint)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("afterprint", handleAfterPrint)
    }
  }, [router])

  // ✅ 轉為發票
  const handleConvertToInvoice = () => {
    if (!confirm("確定要將此報價單轉為發票？\n轉換後將產生發票編號，無法復原。")) return

    startTransition(async () => {
      const result = await convertQuoteToInvoice(quote.id)
      if (result.error) {
        if (result.invoiceId) {
          toast.error(result.error)
          router.push(`/admin/invoices/print/${result.invoiceId}`)
        } else {
          toast.error(result.error)
        }
      } else if (result.invoice) {
        setInvoice(result.invoice)
        toast.success(`發票已建立：${result.invoice.invoiceNumber}`)
      }
    })
  }

  const amountFormatted = quote.amount.toLocaleString("zh-TW", {
    minimumFractionDigits: 2,
  })

  const dateFormatted = new Date(quote.createdAt).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="print-container">
      {/* 螢幕上顯示的提示（列印時隱藏） */}
      <div className="no-print text-center py-8">
        <p className="text-lg text-muted-foreground">
          🖨️ 正在準備列印... 如果沒有自動彈出，請按 Ctrl+P（Cmd+P）
        </p>

        {/* ✅ 按鈕群組 */}
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            手動列印
          </button>

          {/* ✅ 轉為發票按鈕 / 檢視發票按鈕 */}
          {invoice ? (
            <button
              onClick={() => router.push(`/admin/invoices/print/${invoice.id}`)}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              📄 檢視發票（{invoice.invoiceNumber}）
            </button>
          ) : (
            <button
              onClick={handleConvertToInvoice}
              disabled={isPending}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isPending ? "⏳ 轉換中..." : "📄 轉為發票"}
            </button>
          )}

          <button
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-md hover:bg-gray-50"
          >
            返回
          </button>
        </div>

        {/* ✅ 顯示發票狀態 */}
        {invoice && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-md border border-green-200">
            ✅ 已轉為發票（{invoice.invoiceNumber}）
            <span className="text-sm">
              {invoice.status === "PENDING" && "（待付款）"}
              {invoice.status === "PAID" && "（已付款）"}
              {invoice.status === "OVERDUE" && "（逾期）"}
              {invoice.status === "CANCELLED" && "（已作廢）"}
            </span>
          </div>
        )}
      </div>

      {/* ===== 以下是報價單內容（列印時顯示） ===== */}
      <div className="quote-paper">
        {/* 公司抬頭 */}
        <div className="quote-header">
          <div>
            <h1 className="company-name">標緻商標印刷有限公司</h1>
            <p className="company-info">電話：9556 5480</p>
          </div>
          <div className="quote-number">
            <h2>報價單</h2>
            <p>編號：Q-{quote.id.slice(0, 8).toUpperCase()}</p>
            <p>日期：{dateFormatted}</p>
          </div>
        </div>

        <hr className="quote-divider" />

        {/* 客戶資訊 */}
        <div className="quote-customer">
          <h3>客戶資訊</h3>
          <div className="customer-info-grid">
            <p><strong>客戶名稱：</strong>{quote.project.customer.name || "未提供"}</p>
            <p><strong>電子郵件：</strong>{quote.project.customer.email || "未提供"}</p>
          </div>
        </div>

        {/* 專案資訊 */}
        <div className="quote-project">
          <h3>專案資訊</h3>
          <p><strong>專案名稱：</strong>{quote.project.title}</p>
          {quote.project.description && (
            <p><strong>專案描述：</strong>{quote.project.description}</p>
          )}
        </div>

        <hr className="quote-divider" />

        {/* 金額明細 */}
        <div className="quote-amount-section">
          <h3>報價明細</h3>

          <table className="quote-table">
            <thead>
              <tr>
                <th>項目</th>
                <th>說明</th>
                <th className="text-right">金額</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{quote.project.title}</td>
                <td>{quote.details || "—"}</td>
                <td className="text-right">$ {amountFormatted}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="text-right font-bold">總計</td>
                <td className="text-right font-bold text-lg">
                  $ {amountFormatted}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 備註 */}
        {quote.details && (
          <div className="quote-notes">
            <h3>備註</h3>
            <p>{quote.details}</p>
          </div>
        )}

        {/* 簽名區 */}
        <div className="quote-footer">
          <div className="signature-area">
            <p><strong>核准人簽章</strong></p>
            <div className="signature-line" />
          </div>
          <div className="signature-area">
            <p><strong>客戶簽章</strong></p>
            <div className="signature-line" />
          </div>
        </div>

        <p className="quote-disclaimer">
          本報價單有效期 30 天。如有疑問請與我們聯繫。
        </p>
      </div>

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; margin: 0 !important; }
          .quote-paper { padding: 40px; border: none; border-radius: 0; max-width: 100%; }
        }

        .quote-paper {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 40px;
        }

        @media print {
          .quote-paper {
            border: none;
            border-radius: 0;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
