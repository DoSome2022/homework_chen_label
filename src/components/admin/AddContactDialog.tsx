// src/components/admin/EditContactDialog.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useActionState, useEffect ,useRef} from "react"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useRouter } from "next/navigation"                    // ← 新增
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ContactFormInput, upsertCustomerContact } from "@/lib/actions/customerContact"
import { contactSchema } from "@/lib/schemas/customer"


interface Props {
  customerId: string
  customerName?: string | null
  initialData?: {
    name: string
    company?: string | null
    email?: string | null
    address?: string | null
    contactPerson?: string | null
    phone?: string | null
    extraInfo?: string | null
  } | null
}

export function EditContactDialog({ customerId, customerName, initialData }: Props) {
  const [state, formAction, isPending] = useActionState(upsertCustomerContact, {})

const router = useRouter()
  const dialogRef = useRef<HTMLButtonElement>(null)           // 用來控制觸發按鈕

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData
      ? {
          customerId,
          name: initialData.name,
          company: initialData.company ?? "",
          email: initialData.email ?? "",
          address: initialData.address ?? "",
          contactPerson: initialData.contactPerson ?? "",
          phone: initialData.phone ?? "",
          extraInfo: initialData.extraInfo ?? "",
        }
      : {
          customerId,
          name: customerName || "",
          company: "",
          email: "",
          address: "",
          contactPerson: "",
          phone: "",
          extraInfo: "",
        },
  })

  // 成功後自動關閉 Dialog（簡易方式）
useEffect(() => {
  if (state.success) {
    dialogRef.current?.click();
    router.refresh();

    // 可選：尋找並關閉 dialog 的邏輯（視需求保留）
    const closeButton = document.querySelector(
      'button[data-state="open"] ~ button[aria-label="Close"]'
    ) as HTMLButtonElement | null;
    if (closeButton) {
      closeButton.click();
    }
  }
}, [state.success, router]);  // ← 加入 router

const isCreateMode = initialData === null || initialData === undefined

  return (
    <Dialog>
<DialogTrigger asChild>
        <Button 
          ref={dialogRef}
          variant={isCreateMode ? "default" : "outline"}
        >
          {isCreateMode ? "設定聯絡資訊" : "編輯聯絡資訊"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "編輯聯絡資訊" : "設定聯絡資訊"}
          </DialogTitle>
          <DialogDescription>
            請填寫或更新客戶的聯絡資料，帶 * 標記的欄位為必填。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form action={formAction} className="space-y-5 py-4">
            {/* 隱藏欄位：customerId */}
            <input type="hidden" name="customerId" value={customerId} />

            {/* 姓名 / 公司名稱（必填） */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名 / 公司名稱 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：陳先生 / ABC 有限公司" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 公司名稱（選填） */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>公司名稱</FormLabel>
                  <FormControl>
                    <Input placeholder="完整公司名稱（若與上方不同）" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 電子郵件 */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>電子郵件</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@company.com" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 地址 */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>地址</FormLabel>
                  <FormControl>
                    <Input placeholder="完整地址" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 聯絡人 */}
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>聯絡人</FormLabel>
                  <FormControl>
                    <Input placeholder="負責聯絡人姓名" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 電話 */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>電話</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：+852 9123 4567" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 額外資訊 */}
            <FormField
              control={form.control}
              name="extraInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>其他備註 / 額外資訊</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="可記錄部門、職稱、備註事項等"
                      className="min-h-[80px]"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 錯誤訊息顯示 */}
            {state.error && (
              <p className="text-sm text-destructive text-center">{state.error}</p>
            )}

           <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => dialogRef.current?.click()}   // 明確關閉
                disabled={isPending}
              >
                取消
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "儲存中..." : "儲存"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}