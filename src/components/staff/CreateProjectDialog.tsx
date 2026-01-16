'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createProjectForClient } from "@/lib/actions/staff"  // 使用員工專用 Action
import { useState } from "react"

export function CreateProjectDialog({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>建立新項目</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>為客戶建立新項目</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData: FormData) => {
            await createProjectForClient(formData)
            setOpen(false)
          }}
          className="space-y-4"
        >
          <Input name="clientId" type="hidden" value={clientId} />
          <Input name="title" placeholder="項目標題" required />
          <Textarea name="description" placeholder="項目描述（選填）" />
          <Button type="submit">建立項目</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}