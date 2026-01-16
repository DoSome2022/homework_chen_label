// src/components/admin/DeleteContactDialog.tsx
"use client"

import { useState } from "react"
import { useTransition } from "react"
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

import { useRouter } from "next/navigation" // 若想強制重新載入頁面
import { deleteCustomerContact } from "@/lib/actions/customerContact"

interface Props {
  customerId: string
}

export function DeleteContactDialog({ customerId }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCustomerContact(customerId)
      if (result.success) {
        setOpen(false)
        // 可選：顯示成功 toast
        // toast.success("聯絡資訊已刪除")
        router.refresh() // 強制刷新頁面資料
      } else {
        // toast.error(result.error)
        alert(result.error) // 臨時替代
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          刪除聯絡資訊
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>確認刪除</DialogTitle>
          <DialogDescription>
            確定要刪除此客戶的聯絡資訊嗎？此操作無法復原。
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            取消
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "刪除中..." : "確認刪除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}