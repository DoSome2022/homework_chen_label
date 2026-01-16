// src/components/admin/CustomerFilter.tsx
"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X, Tag as TagIcon } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Tag } from "@prisma/client"

interface CustomerFilterProps {
  initialSearch?: string
  initialType?: "NORMAL" | "POTENTIAL"
  initialTags?: string[]
  allTags: Tag[]
}

export function CustomerFilter({
  initialSearch = "",
  initialType,
  initialTags = [],
  allTags,
}: CustomerFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialSearch)
  const debouncedSearch = useDebounce(search, 500)

  const [openTags, setOpenTags] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags)

  useEffect(() => {
    const params = new URLSearchParams(searchParams)

    // 搜尋關鍵字
    if (debouncedSearch) {
      params.set("search", debouncedSearch)
    } else {
      params.delete("search")
    }

    // 客戶類型
    if (initialType) {
      params.set("type", initialType)
    } else {
      params.delete("type")
    }

    // 標籤（多選）
    params.delete("tags")
    selectedTags.forEach((tagId) => {
      params.append("tags", tagId)
    })

    router.replace(`${pathname}?${params.toString()}`)
  }, [debouncedSearch, initialType, selectedTags, pathname, router, searchParams])

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === "all") {
      params.delete("type")
    } else {
      params.set("type", value)
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const clearFilters = () => {
    setSelectedTags([])
    router.replace(pathname)
  }

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* 搜尋輸入 */}
      <Input
        placeholder="搜尋姓名、電子郵件..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-64"
      />

      {/* 客戶類型 */}
      <Select
        defaultValue={initialType || "all"}
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="客戶類型" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部</SelectItem>
          <SelectItem value="NORMAL">普通客</SelectItem>
          <SelectItem value="POTENTIAL">潛力客</SelectItem>
        </SelectContent>
      </Select>

      {/* 標籤多選 */}
      <Popover open={openTags} onOpenChange={setOpenTags}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[180px] justify-between">
            <div className="flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              <span>
                {selectedTags.length === 0
                  ? "標籤過濾"
                  : `${selectedTags.length} 個標籤`}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <CommandInput placeholder="搜尋標籤..." />
            <CommandList>
              <CommandEmpty>沒有找到標籤</CommandEmpty>
              <CommandGroup>
                {allTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => toggleTag(tag.id)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded mr-2 border",
                        selectedTags.includes(tag.id) ? "bg-primary border-primary" : "border-gray-300"
                      )}
                    />
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: tag.color || "#e5e7eb" }}
                    />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 已選標籤顯示（可點擊移除） */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tagId) => {
            const tag = allTags.find((t) => t.id === tagId)
            if (!tag) return null
            return (
              <Badge
                key={tag.id}
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => toggleTag(tag.id)}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color || "#e5e7eb" }}
                />
                {tag.name}
                <X className="h-3 w-3" />
              </Badge>
            )
          })}
        </div>
      )}

      {/* 清空所有過濾 */}
      {(search || initialType || selectedTags.length > 0) && (
        <Button variant="ghost" size="icon" onClick={clearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}