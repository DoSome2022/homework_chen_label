// src/lib/wikipedia.ts

/**
 * 從維基百科 API 取得「當日紀念日」
 * 內部使用，不對外暴露來源
 */
export async function getOnThisDay(): Promise<{
  title: string
  holidays: string[]
}> {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  try {
    // ⭐ 加上 AbortController 設 5 秒 timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(
      `https://api.wikimedia.org/feed/v1/wikipedia/zh/onthisday/all/${month}/${day}`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": "MyProject/1.0",
          "Accept": "application/json",
        },
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Wikipedia API 回應 ${response.status}，使用備用標題`)
      return getFallbackTitle()
    }

    const data = await response.json()

    // ✅ 用 { text: string } 取代 any
    const holidays: string[] = data?.holidays?.map((h: { text: string }) => h.text) ?? []

    let title = ""
    if (holidays.length > 0) {
      // 用第一個節日當標題，不暴露來源
      title = `🎉 ${holidays[0]}`
    } else {
      return getFallbackTitle()
    }

    return {
      title,
      holidays: holidays.slice(0, 3),
    }
  } catch (error) {                    // ✅ 移除 :any
    const errMsg = error instanceof Error ? error.message : "未知錯誤"
    
    if (error instanceof DOMException && error.name === "AbortError") {
      console.warn("Wikipedia API 超時，使用備用標題")
    } else {
      console.error("Wikipedia API 連線失敗:", errMsg)
    }
    return getFallbackTitle()
  }
}

function getFallbackTitle() {
  const now = new Date()
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"]
  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 星期${weekdays[now.getDay()]}`
  return {
    title: `🎁 ${dateStr} 精選福袋`,
    holidays: [],
  }
}
