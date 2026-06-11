// src/components/client/SearchInput.tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

interface Props {
  defaultValue?: string
}

export function SearchInput({ defaultValue = "" }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)

  // 當外部 defaultValue 變更時同步（例如按上一頁）
  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (term.trim()) {
        params.set("q", term.trim())
      } else {
        params.delete("q")
      }
      params.delete("page") // 搜尋時重置到第一頁
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  // 按下 Enter 或點擊搜尋按鈕時觸發
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch(value)
    }
  }

  return (
    <div className="relative mb-6 max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="搜尋產品名稱或說明..."
        className="w-full px-4 py-2 pl-10 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {/* 放大鏡圖示（使用 lucide-react） */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>

      {/* 清除按鈕（有搜尋內容時顯示） */}
      {value && (
        <button
          onClick={() => {
            setValue("")
            handleSearch("")
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
