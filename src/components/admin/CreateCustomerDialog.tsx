// src/components/admin/CreateCustomerDialog.tsx
"use client"

import { useState, useTransition } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createCustomer } from "@/lib/actions/admin-customer"
import { UserPlus, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function CreateCustomerDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [customerType, setCustomerType] = useState<string>("NORMAL")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("customerType", customerType)

    startTransition(async () => {
      const result = await createCustomer(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("客戶建立成功！")
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          新增客戶
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>建立新客戶</DialogTitle>
          <DialogDescription>
            填寫以下資訊手動建立客戶帳號，客戶將可使用 Email + 密碼登入。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* 姓名 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              姓名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="客戶姓名"
              className="col-span-3"
            />
          </div>

          {/* Email */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="customer@example.com"
              className="col-span-3"
            />
          </div>

          {/* 密碼 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              密碼 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="至少 6 位"
              minLength={6}
              className="col-span-3"
            />
          </div>

          {/* 電話 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              電話
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0912-345-678（選填）"
              className="col-span-3"
            />
          </div>

          {/* 客戶類型 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">客戶類型</Label>
            <Select value={customerType} onValueChange={setCustomerType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選擇類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">普通客</SelectItem>
                <SelectItem value="POTENTIAL">潛力客</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              取消
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              建立客戶
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
