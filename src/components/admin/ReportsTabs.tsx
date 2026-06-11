'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportTable } from "./ReportTable"

import { AmountOrderData, BroadcastCampaignData, EmployeeStaffData, ProductReportData, ReportWithRelations, SalesEmployeeData } from '@/app/dashboard/admin/reports/page'


// ─────────────────────────────────────
//  Props 型別
// ─────────────────────────────────────
interface ReportsTabsProps {
  reports: ReportWithRelations[]
  reportsByType: { type: string; count: number }[]
  // SALES
  salesData: SalesEmployeeData[]
  salesSummary: { totalSales: number; totalQuotes: number; totalEmployees: number }
  // PRODUCT
  productData: ProductReportData[]
  // AMOUNT
  amountData: AmountOrderData[]
  amountSummary: { totalSales: number; avgQuote: number; quoteCount: number }
  // BROADCAST
  broadcastData: BroadcastCampaignData[]
  // EMPLOYEE
  employeeData: EmployeeStaffData[]
}

// ─────────────────────────────────────
//  共用排序工具
// ─────────────────────────────────────
type SortDirection = 'asc' | 'desc' | null

function useSort<T extends string>() {
  const [sortKey, setSortKey] = useState<T | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (key: T) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else if (sortDirection === 'desc') { setSortKey(null); setSortDirection(null) }
      else setSortDirection('asc')
    } else {
      setSortKey(key); setSortDirection('asc')
    }
  }

  const SortArrow = ({ columnKey }: { columnKey: T }) => {
    if (sortKey !== columnKey) {
      return (
        <svg className="inline-block w-3 h-3 text-gray-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      )
    }
    return (
      <svg className={`inline-block w-3 h-3 ml-1 text-blue-500 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
    )
  }

  return { sortKey, sortDirection, handleSort, SortArrow }
}

// ─────────────────────────────────────
//  🏆 SALES REPORT VIEW
// ─────────────────────────────────────
function SalesReportView({
  data,
  summary,
}: {
  data: SalesEmployeeData[]
  summary: { totalSales: number; totalQuotes: number; totalEmployees: number }
}) {
  const [selectedYear, setSelectedYear] = useState('2025')
  const [selectedMonth, setSelectedMonth] = useState('12')
  // const [searchKeyword, setSearchKeyword] = useState('')

  type SortKey = 'name' | 'quoteCount' | 'totalAmount' | 'avgQuote'
  const { sortKey, sortDirection, handleSort, SortArrow } = useSort<SortKey>()

  const sortedData = useMemo(() => {
    const list = [...data]
    if (sortKey && sortDirection) {
      list.sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey]
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortDirection === 'asc' ? va - vb : vb - va
        }
        return sortDirection === 'asc'
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va))
      })
    }
    return list
  }, [data,  sortKey, sortDirection])

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <YearMonthSelect year={selectedYear} month={selectedMonth} onYearChange={setSelectedYear} onMonthChange={setSelectedMonth} />
        {/* <SearchInput value={searchKeyword} onChange={setSearchKeyword} />
        <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">搜尋</button> */}
      </div>

      <div className="flex flex-wrap items-center gap-8 mb-6">
        <StatCard icon="cart" label="金額" value={`$${summary.totalSales.toLocaleString()}`} />
        <StatCard icon="document" label="報價單數" value={String(summary.totalQuotes)} />
        <StatCard icon="user" label="員工" value={String(summary.totalEmployees)} />
      </div>

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full min-w-max text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-16">查看</th>
              <ThSort label="銷售員" sortKey="name" onClick={handleSort} Arrow={<SortArrow columnKey="name" />} />
              <ThSort label="報價單數" sortKey="quoteCount" onClick={handleSort} Arrow={<SortArrow columnKey="quoteCount" />} />
              <ThSort label="報價總額" sortKey="totalAmount" onClick={handleSort} Arrow={<SortArrow columnKey="totalAmount" />} />
              <ThSort label="平均報價" sortKey="avgQuote" onClick={handleSort} Arrow={<SortArrow columnKey="avgQuote" />} />
            </tr>
          </thead>
          <tbody>
            {sortedData.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3"><EyeButton /></td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.quoteCount}</td>
                <td className="px-4 py-3 whitespace-nowrap">${emp.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap">${emp.avgQuote.toLocaleString()}</td>
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">暫無銷售資料</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─────────────────────────────────────
//  📦 PRODUCT REPORT VIEW
// ─────────────────────────────────────
function ProductReportView({ data }: { data: ProductReportData[] }) {
  type SortKey = 'sku' | 'name' | 'price' | 'totalCost' | 'profit' | 'profitRate'
  const { sortKey, sortDirection, handleSort, SortArrow } = useSort<SortKey>()
  const sortedData = useMemo(() => {
    const list = [...data]
    if (sortKey && sortDirection) {
      list.sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey]
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortDirection === 'asc' ? va - vb : vb - va
        }
        const sa = String(va).toLowerCase(), sb = String(vb).toLowerCase()
        return sortDirection === 'asc'
          ? sa.localeCompare(sb)
          : sb.localeCompare(sa)
      })
    }
    return list
  }, [data, sortKey, sortDirection])

  return (
    <>
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full min-w-max text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-600">圖片</th>
              <ThSort label="產品編號" sortKey="sku" onClick={handleSort} Arrow={<SortArrow columnKey="sku" />} />
              <ThSort label="產品名稱" sortKey="name" onClick={handleSort} Arrow={<SortArrow columnKey="name" />} />
              <ThSort label="售價" sortKey="price" onClick={handleSort} Arrow={<SortArrow columnKey="price" />} />
              <ThSort label="總成本" sortKey="totalCost" onClick={handleSort} Arrow={<SortArrow columnKey="totalCost" />} />
              <ThSort label="毛利" sortKey="profit" onClick={handleSort} Arrow={<SortArrow columnKey="profit" />} />
              <ThSort label="毛利率" sortKey="profitRate" onClick={handleSort} Arrow={<SortArrow columnKey="profitRate" />} />
              <th className="px-4 py-3 text-left font-medium text-gray-600">供應商</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">狀態</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">無</div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{item.sku}</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium">{item.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">${item.price.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap">${item.totalCost.toLocaleString()}</td>
                <td className={`px-4 py-3 whitespace-nowrap font-medium ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${item.profit.toLocaleString()}
                </td>
                <td className={`px-4 py-3 whitespace-nowrap font-medium ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.profitRate}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{item.supplier ?? '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.isArchived ? (
                    <span className="text-red-500 text-xs bg-red-50 px-2 py-0.5 rounded">已封存</span>
                  ) : item.isFeatured ? (
                    <span className="text-amber-600 text-xs bg-amber-50 px-2 py-0.5 rounded">精選</span>
                  ) : (
                    <span className="text-gray-400 text-xs">一般</span>
                  )}
                </td>
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">暫無產品資料</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
// ─────────────────────────────────────
//  💰 AMOUNT REPORT VIEW
// ─────────────────────────────────────
function AmountReportView({
  data,
  summary,
}: {
  data: AmountOrderData[]
  summary: { totalSales: number; avgQuote: number; quoteCount: number }
}) {
  const [selectedYear, setSelectedYear] = useState('2025')
  const [selectedMonth, setSelectedMonth] = useState('12')
  // const [searchKeyword, setSearchKeyword] = useState('')

  type SortKey = 'orderNo' | 'customerName' | 'phone' | 'date' | 'customerType' | 'company' | 'amount'
  const { sortKey, sortDirection, handleSort, SortArrow } = useSort<SortKey>()

  const sortedData = useMemo(() => {
      const list = [...data]
    if (sortKey && sortDirection) {
      list.sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey]
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortDirection === 'asc' ? va - vb : vb - va
        }
        return sortDirection === 'asc'
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va))
      })
    }
    return list
  }, [data,  sortKey, sortDirection])

  const typeLabel: Record<string, string> = {
    NORMAL: '會員',
    POTENTIAL: '新客戶',
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <YearMonthSelect year={selectedYear} month={selectedMonth} onYearChange={setSelectedYear} onMonthChange={setSelectedMonth} />
        {/* <SearchInput value={searchKeyword} onChange={setSearchKeyword} />
        <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">搜尋</button> */}
      </div>

      <div className="flex flex-wrap items-center gap-8 mb-6">
        <StatCard icon="cart" label="總銷售金額" value={`$${summary.totalSales.toLocaleString()}`} />
        <div>
          <p className="text-gray-600 text-sm">平均報價金額</p>
          <p className="text-xl font-semibold text-amber-700">${summary.avgQuote.toLocaleString()}</p>
        </div>
        <StatCard icon="document" label="報價單數量" value={String(summary.quoteCount)} />
      </div>

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full min-w-max text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-16">查看</th>
              <ThSort label="訂單編號" sortKey="orderNo" onClick={handleSort} Arrow={<SortArrow columnKey="orderNo" />} />
              <ThSort label="客戶名稱" sortKey="customerName" onClick={handleSort} Arrow={<SortArrow columnKey="customerName" />} />
              <ThSort label="電話號碼" sortKey="phone" onClick={handleSort} Arrow={<SortArrow columnKey="phone" />} />
              <ThSort label="訂單日期" sortKey="date" onClick={handleSort} Arrow={<SortArrow columnKey="date" />} />
              <ThSort label="客戶類型" sortKey="customerType" onClick={handleSort} Arrow={<SortArrow columnKey="customerType" />} />
              <ThSort label="公司名稱" sortKey="company" onClick={handleSort} Arrow={<SortArrow columnKey="company" />} />
              <ThSort label="訂單金額" sortKey="amount" onClick={handleSort} Arrow={<SortArrow columnKey="amount" />} align="right" />
            </tr>
          </thead>
          <tbody>
            {sortedData.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3"><EyeButton /></td>
                <td className="px-4 py-3 whitespace-nowrap">{order.orderNo}</td>
                <td className="px-4 py-3 whitespace-nowrap">{order.customerName}</td>
                <td className="px-4 py-3 whitespace-nowrap">{order.phone}</td>
                <td className="px-4 py-3 whitespace-nowrap">{order.date}</td>
                <td className="px-4 py-3 whitespace-nowrap">{typeLabel[order.customerType] ?? order.customerType}</td>
                <td className="px-4 py-3">{order.company}</td>
                <td className="px-4 py-3 text-right font-medium whitespace-nowrap">${order.amount.toLocaleString()}</td>
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">暫無金額資料</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─────────────────────────────────────
//  📢 BROADCAST REPORT VIEW
// ─────────────────────────────────────
function BroadcastReportView({ data }: { data: BroadcastCampaignData[] }) {
  const [selectedYear, setSelectedYear] = useState('2025')
  const [selectedMonth, setSelectedMonth] = useState('12')
  // const [searchKeyword, setSearchKeyword] = useState('')

  type SortKey = 'name' | 'applications'
  const { sortKey, sortDirection, handleSort, SortArrow } = useSort<SortKey>()

  const sortedData = useMemo(() => {
const list = [...data]
    if (sortKey && sortDirection) {
      list.sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey]
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortDirection === 'asc' ? va - vb : vb - va
        }
        return sortDirection === 'asc'
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va))
      })
    }
    return list
  }, [data,  sortKey, sortDirection])

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <YearMonthSelect year={selectedYear} month={selectedMonth} onYearChange={setSelectedYear} onMonthChange={setSelectedMonth} />
        {/* <SearchInput value={searchKeyword} onChange={setSearchKeyword} />
        <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">搜尋</button> */}
      </div>

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full min-w-max text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <ThSort label="廣播報告" sortKey="name" onClick={handleSort} Arrow={<SortArrow columnKey="name" />} />
              <ThSort label="發送次數" sortKey="applications" onClick={handleSort} Arrow={<SortArrow columnKey="applications" />} />
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">{item.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{item.applications}</td>
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center py-8 text-gray-500">暫無廣播資料</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─────────────────────────────────────
//  👥 EMPLOYEE REPORT VIEW
// ─────────────────────────────────────
function EmployeeReportView({ data }: { data: EmployeeStaffData[] }) {
  const [selectedYear, setSelectedYear] = useState('2025')
  const [selectedMonth, setSelectedMonth] = useState('12')
  // const [searchKeyword, setSearchKeyword] = useState('')

  type SortKey = 'staffId' | 'name' | 'followUps' | 'quoted' | 'completed'
  const { sortKey, sortDirection, handleSort, SortArrow } = useSort<SortKey>()

  const sortedData = useMemo(() => {
const list = [...data]
    if (sortKey && sortDirection) {
      list.sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey]
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortDirection === 'asc' ? va - vb : vb - va
        }
        return sortDirection === 'asc'
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va))
      })
    }
    return list
  }, [data, sortKey, sortDirection])

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <YearMonthSelect year={selectedYear} month={selectedMonth} onYearChange={setSelectedYear} onMonthChange={setSelectedMonth} />
        {/* <SearchInput value={searchKeyword} onChange={setSearchKeyword} />
        <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">搜尋</button> */}
      </div>

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full min-w-max text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <ThSort label="員工編號" sortKey="staffId" onClick={handleSort} Arrow={<SortArrow columnKey="staffId" />} />
              <ThSort label="員工名稱" sortKey="name" onClick={handleSort} Arrow={<SortArrow columnKey="name" />} />
              <ThSort label="跟進數量" sortKey="followUps" onClick={handleSort} Arrow={<SortArrow columnKey="followUps" />} />
              <ThSort label="已報價" sortKey="quoted" onClick={handleSort} Arrow={<SortArrow columnKey="quoted" />} />
              <ThSort label="已完結" sortKey="completed" onClick={handleSort} Arrow={<SortArrow columnKey="completed" />} />
            </tr>
          </thead>
          <tbody>
            {sortedData.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-amber-600 font-medium">{emp.staffId}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.followUps}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.quoted}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.completed}</td>
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">暫無員工資料</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ═════════════════════════════════════════
//  共用子元件
// ═════════════════════════════════════════

function YearMonthSelect({ year, month, onYearChange, onMonthChange }: {
  year: string; month: string; onYearChange: (v: string) => void; onMonthChange: (v: string) => void
}) {
  return (
    <>
      <select value={year} onChange={e => onYearChange(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
        <option value="2024">2024</option>
        <option value="2025">2025</option>
      </select>
      <select value={month} onChange={e => onMonthChange(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i + 1}>{i + 1}月</option>
        ))}
      </select>
    </>
  )
}

// function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
//   return (
//     <div className="relative flex-1 max-w-md">
//       <input type="text" value={value} onChange={e => onChange(e.target.value)}
//         placeholder="搜尋"
//         className="w-full border border-gray-300 rounded pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
//       <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//       </svg>
//     </div>
//   )
// }

function StatCard({ icon, label, value }: { icon: 'cart' | 'document' | 'user'; label: string; value: string }) {
  const icons = {
    cart: (
      <svg className="w-10 h-10 text-gray-800 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    document: (
      <svg className="w-10 h-10 text-gray-800 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    user: (
      <svg className="w-10 h-10 text-gray-800 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  }

  return (
    <div className="flex items-center gap-3">
      {icons[icon]}
      <div>
        <p className="text-gray-600 text-sm">{label}</p>
        <p className="text-xl font-semibold text-amber-700">{value}</p>
      </div>
    </div>
  )
}

function ThSort<T extends string>({ label, sortKey, onClick, Arrow, align }: {
  label: string; sortKey: T; onClick: (k: T) => void; Arrow: React.ReactNode; align?: 'left' | 'right'
}) {
  return (
    <th
      className={`px-4 py-3 ${align === 'right' ? 'text-right' : 'text-left'} font-medium text-gray-600 whitespace-nowrap cursor-pointer hover:bg-gray-100 select-none`}
      onClick={() => onClick(sortKey)}
    >
      {label}{Arrow}
    </th>
  )
}

function EyeButton() {
  return (
    <button className="text-gray-500 hover:text-blue-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </button>
  )
}

// ═════════════════════════════════════════
//  🏠 主元件
// ═════════════════════════════════════════
export function ReportsTabs({
  reports,
  reportsByType,
  salesData,
  salesSummary,
  productData,
  amountData,
  amountSummary,
  broadcastData,
  employeeData,
}: ReportsTabsProps) {
  const typeLabels: Record<string, string> = {
    SALES: '銷售',
    PRODUCT: '產品',
    AMOUNT: '金額',
    BROADCAST: '廣播/廣告',
    EMPLOYEE: '員工',
  }

  return (
    <Tabs defaultValue="ALL" className="w-full">
      <TabsList className="grid w-full grid-cols-6 max-w-4xl">
        <TabsTrigger value="ALL">全部 ({reports.length})</TabsTrigger>
        {reportsByType.map(({ type: t, count }) => (
          <TabsTrigger key={t} value={t}>
            {typeLabels[t] ?? t} ({count})
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="ALL" className="mt-6">
        <ReportTable reports={reports} />
      </TabsContent>

      <TabsContent value="SALES" className="mt-6">
        <SalesReportView data={salesData} summary={salesSummary} />
      </TabsContent>

      <TabsContent value="PRODUCT" className="mt-6">
        <ProductReportView data={productData} />
      </TabsContent>

      <TabsContent value="AMOUNT" className="mt-6">
        <AmountReportView data={amountData} summary={amountSummary} />
      </TabsContent>

      <TabsContent value="BROADCAST" className="mt-6">
        <BroadcastReportView data={broadcastData} />
      </TabsContent>

      <TabsContent value="EMPLOYEE" className="mt-6">
        <EmployeeReportView data={employeeData} />
      </TabsContent>
    </Tabs>
  )
}
