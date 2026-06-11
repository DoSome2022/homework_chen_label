// src/components/admin/EditBroadcastDialog.tsx
'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { BroadcastForm } from "./BroadcastForm"
import { Edit } from "lucide-react"
import { useState } from "react"
import { Broadcast } from "@prisma/client"

export function EditBroadcastDialog({ broadcast }: { broadcast: Broadcast }) {
  const [open, setOpen] = useState(false)

  // ✅ 將 Prisma Broadcast 轉換為 BroadcastForm 接受的格式
  //    BroadcastStatus 有 4 個值，但表單只接受 DRAFT / PUBLISHED
  const formBroadcast = {
    id: broadcast.id,
    title: broadcast.title,
    content: broadcast.content,
    imageUrl: broadcast.imageUrl,
    videoUrl: broadcast.videoUrl,
    scheduledAt: broadcast.scheduledAt,
    status: (broadcast.status === "DRAFT" || broadcast.status === "PUBLISHED")
      ? broadcast.status
      : undefined,  // PAUSED / ARCHIVED 不在表單選項中，設為 undefined
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <BroadcastForm broadcast={formBroadcast} onSuccess={() => setOpen(false)} />
    </Dialog>
  )
}
