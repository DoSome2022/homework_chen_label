// src/components/admin/SetDeadlineDialog.tsx
"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { updateProjectDeadline } from "@/lib/actions/admin-project"

interface SetDeadlineDialogProps {
  projectId: string
  currentDeadline: Date | null
}

export function SetDeadlineDialog({ projectId, currentDeadline }: SetDeadlineDialogProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(currentDeadline ?? undefined)
  const [isPending, setIsPending] = useState(false)

  const handleSave = async () => {
    setIsPending(true)
    try {
      await updateProjectDeadline(projectId, date ?? null)
      setOpen(false)
    } catch (error) {
      console.error("更新截止日期失敗", error)
      // 可在此處加入錯誤提示（例如 toast）
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {currentDeadline ? "修改截止日期" : "設定截止日期"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>設定項目截止日期</DialogTitle>
          <DialogDescription>
            選擇項目的預計完成日期（可留空表示未設定）
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "yyyy-MM-dd") : "選擇日期"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "儲存中..." : "儲存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}