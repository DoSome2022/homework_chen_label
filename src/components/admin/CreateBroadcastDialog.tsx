// src/components/admin/CreateBroadcastDialog.tsx
'use client'

import { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  // DialogHeader,
  // DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BroadcastForm } from "./BroadcastForm"

export function CreateBroadcastDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>新增廣播</Button>
      </DialogTrigger>

      {/* 關鍵：表單內容必須放在 DialogContent 內才會在對話框中顯示 */}
      <DialogContent className="sm:max-w-[600px]">
        {/* <DialogHeader>
          <DialogTitle>新增廣播</DialogTitle>
        </DialogHeader> */}

        {/* 這裡放表單元件 */}
        <BroadcastForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}