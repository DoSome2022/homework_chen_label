// src/components/client/ApplyProductForm.tsx
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { applyForProduct } from "@/lib/actions/client"

export function ApplyProductForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>申請下單</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>申請產品</DialogTitle>
        </DialogHeader>

        <form
          action={async (formData: FormData) => {
            formData.append("productId", productId)
            await applyForProduct(formData)
            setOpen(false)  // 成功後關閉 Dialog
          }}
          className="space-y-4"
        >
          <Input name="title" placeholder="申請標題" required />
          <Textarea name="description" placeholder="申請說明（選填）" />
          <Button type="submit" className="w-full">
            送出申請
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}