// src/app/admin/invoices/print/[id]/PrintInvoiceClient.tsx
"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateInvoiceStatus } from "@/lib/actions/invoice"
import { toast } from "sonner"

type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"

interface InvoiceData {
  id: string
  invoiceNumber: string
  status: InvoiceStatus
  amount: number
  details: string | null
  issuedDate: Date
  dueDate: Date | null
  paidDate: Date | null
  createdAt: Date
  quote: {
    id: string
    details: string | null
    project: {
      title: string
      description: string | null
      customer: {
        name: string | null
        email: string | null
      }
    }
  }
}

export function PrintInvoiceClient({ invoice }: { invoice: InvoiceData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(invoice.status)

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print()
    }, 500)

    const handleAfterPrint = () => {
      // 不自動返回
    }
    window.addEventListener("afterprint", handleAfterPrint)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("afterprint", handleAfterPrint)
    }
  }, [])

  const handleStatusChange = (newStatus: InvoiceStatus) => {
    if (newStatus === "CANCELLED" && !confirm("確定要作廢此發票？")) return
    if (newStatus === "PAID" && !confirm("確認此發票已收款？")) return

    startTransition(async () => {
      const result = await updateInvoiceStatus(invoice.id, newStatus)
      if (result.success) {
        setStatus(newStatus)
        toast.success(
          newStatus === "PAID" ? "發票已標記為已付款" :
          newStatus === "CANCELLED" ? "發票已作廢" :
          "發票狀態已更新"
        )
      }
    })
  }

  const amountFormatted = invoice.amount.toLocaleString("zh-TW", {
    minimumFractionDigits: 2,
  })

  const issuedDateFormatted = new Date(invoice.issuedDate).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const dueDateFormatted = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "未設定"

  const paidDateFormatted = invoice.paidDate
    ? new Date(invoice.paidDate).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  const statusBadge = {
    PENDING: { label: "待付款", color: "bg-yellow-100 text-yellow-800" },
    PAID: { label: "已付款", color: "bg-green-100 text-green-800" },
    OVERDUE: { label: "逾期", color: "bg-red-100 text-red-800" },
    CANCELLED: { label: "已作廢", color: "bg-gray-100 text-gray-800" },
  }[status]

  return (
    <div className="print-container">
      {/* 螢幕控制區 */}
      <div className="no-print text-center py-8 space-y-4">
        <h2 className="text-2xl font-bold">
          發票 #{invoice.invoiceNumber}
        </h2>

        {/* 狀態標籤 */}
        <div className="flex justify-center">
          <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${statusBadge.color}`}>
            {statusBadge.label}
          </span>
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            🖨️ 列印 / 下載 PDF
          </button>

          <button
            onClick={() => router.push(`/admin/quotes/print/${invoice.quote.id}`)}
            className="px-6 py-2 border rounded-md hover:bg-gray-50"
          >
            查看原始報價單
          </button>

            <button
              onClick={() => router.push("/dashboard/admin/invoices")}
              className="px-6 py-2 border rounded-md hover:bg-gray-50"
            >
              返回發票列表
            </button>

        </div>

        {/* 狀態管理按鈕 */}
        <div className="flex justify-center gap-2">
          {status === "PENDING" && (
            <>
              <button
                onClick={() => handleStatusChange("PAID")}
                disabled={isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                ✅ 標記已付款
              </button>
              <button
                onClick={() => handleStatusChange("CANCELLED")}
                disabled={isPending}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                🚫 作廢發票
              </button>
            </>
          )}
          {status === "PAID" && (
            <span className="text-sm text-green-600">✓ 已完成收款</span>
          )}
          {status === "CANCELLED" && (
            <span className="text-sm text-red-600">✗ 此發票已作廢</span>
          )}
        </div>
      </div>

      {/* ===== 發票內容 ===== */}
      <div className="invoice-paper">
        {/* 公司抬頭 */}
        <div className="invoice-header">
          <div>
            <h1 className="company-name">標緻商標印刷有限公司</h1>
            <p className="company-info">電話：9556 5480</p>
            <p className="company-info">地址：FLAT/RM 130, 1/F,GODFREY CENTRE, 175-185 LAI CHI KOK ROAD, SHAM SHUI PO,KLN</p>
          </div>
          <div className="invoice-number-area">
            <h2>發票</h2>
            <p className="invoice-number">INVOICE #{invoice.invoiceNumber}</p>
            <p>開立日期：{issuedDateFormatted}</p>
            <p>到期日期：{dueDateFormatted}</p>
            {paidDateFormatted && (
              <p>付款日期：{paidDateFormatted}</p>
            )}
          </div>
        </div>

        <hr className="invoice-divider" />

        {/* 客戶資訊 */}
        <div className="invoice-customer">
          <h3>開立給</h3>
          <div className="customer-info-grid">
            <p><strong>客戶名稱：</strong>{invoice.quote.project.customer.name || "未提供"}</p>
            <p><strong>電子郵件：</strong>{invoice.quote.project.customer.email || "未提供"}</p>
          </div>
        </div>

        {/* 專案資訊 */}
        <div className="invoice-project">
          <p><strong>專案名稱：</strong>{invoice.quote.project.title}</p>
        </div>

        <hr className="invoice-divider" />

        {/* 金額明細 */}
        <div className="invoice-amount-section">
          <h3>費用明細</h3>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>項目</th>
                <th>說明</th>
                <th className="text-right">金額</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{invoice.quote.project.title}</td>
                <td>{invoice.details || invoice.quote.details || "—"}</td>
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

        {/* 付款資訊 */}
        <div className="invoice-payment-info">
          <h3>付款方式</h3>
          <p>銀行匯款 / 轉帳</p>
          <div className="bank-details">
            <p>銀行：南洋商業銀行</p>
            <p>帳號：04348310286781</p>
            <p>戶名：標緻商標印刷有限公司</p>
          </div>
        </div>

        {/* 備註 */}
        {invoice.details && (
          <div className="invoice-notes">
            <h3>備註</h3>
            <p>{invoice.details}</p>
          </div>
        )}

        {/* 狀態印章 */}
        {status === "PAID" && (
          <div className="paid-stamp">已付款</div>
        )}
        {status === "CANCELLED" && (
          <div className="cancelled-stamp">作廢</div>
        )}
      </div>

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; margin: 0 !important; }
          .invoice-paper { padding: 40px; border: none; border-radius: 0; max-width: 100%; }
          .paid-stamp, .cancelled-stamp { display: none; }
        }

        .invoice-paper {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 40px;
          position: relative;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }

        .company-info {
          font-size: 12px;
          color: #555;
          margin: 2px 0;
        }

        .invoice-number-area {
          text-align: right;
        }

        .invoice-number-area h2 {
          font-size: 28px;
          margin: 0;
          color: #dc2626;
        }

        .invoice-number {
          font-size: 14px;
          font-weight: bold;
          margin: 4px 0;
        }

        .invoice-number-area p {
          font-size: 12px;
          margin: 2px 0;
        }

        .invoice-divider {
          border: none;
          border-top: 2px solid #333;
          margin: 20px 0;
        }

        .invoice-customer h3 {
          font-size: 16px;
          margin-bottom: 8px;
        }

        .customer-info-grid p {
          margin: 4px 0;
          font-size: 14px;
        }

        .invoice-project p {
          font-size: 14px;
          margin: 4px 0;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }

        .invoice-table th {
          background-color: #f3f4f6;
          padding: 10px 12px;
          text-align: left;
          font-size: 14px;
          border-bottom: 2px solid #ddd;
        }

        .invoice-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }

        .invoice-table .text-right {
          text-align: right;
        }

        .invoice-table tfoot td {
          border-top: 2px solid #333;
          padding-top: 12px;
        }

        .invoice-payment-info {
          margin-top: 20px;
          padding: 16px;
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
        }

        .invoice-payment-info h3 {
          font-size: 14px;
          margin: 0 0 8px 0;
          color: #16a34a;
        }

        .invoice-payment-info p {
          font-size: 13px;
          margin: 2px 0;
        }

        .bank-details {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed #bbf7d0;
        }

        .invoice-notes {
          margin-top: 20px;
          padding: 16px;
          background-color: #f9fafb;
          border-left: 4px solid #dc2626;
        }

        .invoice-notes h3 {
          font-size: 14px;
          margin: 0 0 4px 0;
        }

        .invoice-notes p {
          font-size: 13px;
          margin: 0;
          color: #555;
        }

        .paid-stamp {
          position: absolute;
          top: 120px;
          right: 60px;
          transform: rotate(-15deg);
          font-size: 48px;
          font-weight: bold;
          color: rgba(22, 163, 74, 0.3);
          border: 4px solid rgba(22, 163, 74, 0.3);
          padding: 20px 40px;
          border-radius: 8px;
          pointer-events: none;
        }

        .cancelled-stamp {
          position: absolute;
          top: 120px;
          right: 80px;
          transform: rotate(-15deg);
          font-size: 48px;
          font-weight: bold;
          color: rgba(220, 38, 38, 0.3);
          border: 4px solid rgba(220, 38, 38, 0.3);
          padding: 20px 40px;
          border-radius: 8px;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
