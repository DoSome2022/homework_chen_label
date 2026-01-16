// src/hooks/use-debounce.ts
import { useEffect, useState } from "react"

/**
 * 自訂 Hook：對值進行防抖（debounce），在使用者停止輸入一段時間後才更新最終值
 * @param value 要防抖的值
 * @param delay 延遲毫秒數（預設 500ms）
 * @returns 防抖後的值
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 清理函式：當 value 改變或元件卸載時，清除計時器
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}