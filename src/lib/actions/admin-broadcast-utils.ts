// src/lib/actions/admin-broadcast-utils.ts
// 這個檔案沒有 "use server"！放常數和輔助函數

export const CACHE_TAGS = {
  BROADCASTS: 'broadcasts',
  DASHBOARD: 'dashboard',
} as const

export async function safeRevalidate(tags: string[], paths: string[] = []) {
  try {
    const { revalidateTag, revalidatePath } = await import('next/cache')
    for (const tag of tags) {
      revalidateTag(tag)
    }
    for (const path of paths) {
      revalidatePath(path)
    }
  } catch (error) {
    console.warn('[safeRevalidate] 跳過重新驗證:', {
      tags,
      paths,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
