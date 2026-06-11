'use client'


// ✅ 定義 Quote 型別取代 any
interface QuoteData {
  id: string
  createdAt: Date | string
  amount: number
  details?: string | null
}

// 這是一個純展示用的組件，專門用於列印
export function QuotePrintView({ 
  quote, 
  customerName, 
  projectName 
}: { 
  quote: QuoteData,   
  customerName: string, 
  projectName: string 
}) {
  return (
    <div className="p-10 bg-white text-black min-h-screen print:p-0">
      <div className="flex justify-between items-start border-b pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-600">QUOTATION</h1>
          <p className="text-gray-500 mt-2">報價單編號: #{quote.id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="text-right">
          <h2 className="font-bold text-xl">標緻商標印刷有限公司</h2>
          <p className="text-sm text-gray-600">Date: {new Date(quote.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="text-sm font-semibold uppercase text-gray Underscore">客戶資訊 (Bill To)</h3>
          <p className="text-lg font-medium">{customerName}</p>
          <p className="text-gray-600">{customerName.split(' ')[0]} 先生/小姐</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase text-gray-500">專案資訊</h3>
          <p className="text-lg font-medium">{projectName}</p>
        </div>
      </div>

      <table className="w-full mb-12">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">項目描述</th>
            <th className="text-right p-3">金額</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-3">
              <p className="font-medium">專案服務費用</p>
              <p className="text-sm text-gray-50
              ">{quote.details || "無詳細說明"}</p>
            </td>
            <td className="p-3 text-right font-bold">
              ${quote.amount.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-1/3 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>小計:</span>
            <span>${quote.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2 text-blue-600">
            <span>總計:</span>
            <span>${quote.amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-20 text-center text-sm text-gray-400 border-t pt-8">
        感謝您的合作，如有任何問題請聯繫我們的業務人員。
      </div>
    </div>
  )
}
