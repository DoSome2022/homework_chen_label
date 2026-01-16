'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { BroadcastForm } from "./BroadcastForm"
import { Edit } from "lucide-react"
import { useState } from "react"
import { Broadcast } from "@prisma/client"
export function EditBroadcastDialog({ broadcast }: { broadcast: Broadcast }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <BroadcastForm broadcast={broadcast} onSuccess={() => setOpen(false)} />
    </Dialog>
  )
}