// src/components/shared/SendToCustomerDialog.tsx
"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Send, Loader2, Mail, Phone, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface Customer {
  id: string
  name: string | null
  email: string | null
  phoneOtps: { phone: string }[]
  customerContacts?: { phone?: string | null; email?: string | null } | null
}

interface SendToCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customers: Customer[]
  title: string
  documentType: "QUOTE" | "INVOICE"
  documentId: string
  documentTitle: string
  onSend: (customerId: string, channels: string[]) => Promise<{ success: boolean; error?: string }>
}

export function SendToCustomerDialog({
  open,
  onOpenChange,
  customers,
  documentType,
  documentId,
  documentTitle,
  onSend,
}: SendToCustomerDialogProps) {
  const [search, setSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [sentResult, setSentResult] = useState<{ customerName: string; channels: string[] } | null>(null)

  // 搜尋過濾
  const filteredCustomers = customers.filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      getPhone(c).toLowerCase().includes(q)
    )
  })

  const getPhone = (customer: Customer): string => {
    return (
      customer.customerContacts?.phone ||
      customer.phoneOtps?.[0]?.phone ||
      ""
    )
  }

  const getEmail = (customer: Customer): string => {
    return customer.customerContacts?.email || customer.email || ""
  }

  const toggleChannel = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    )
  }

  const handleSend = () => {
    if (!selectedCustomer) return
    if (selectedChannels.length === 0) {
      toast.error("請選擇至少一個發送方式")
      return
    }

    startTransition(async () => {
      const result = await onSend(selectedCustomer.id, selectedChannels)
      if (result.success) {
        setSentResult({
          customerName: selectedCustomer.name || "未命名",
          channels: selectedChannels,
        })
        toast.success("已成功發送！")
      } else {
        toast.error(result.error || "發送失敗")
      }
    })
  }

  const resetDialog = () => {
    setSearch("")
    setSelectedCustomer(null)
    setSelectedChannels([])
    setSentResult(null)
  }

  const documentTypeLabel = documentType === "QUOTE" ? "報價單" : "發票"

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) resetDialog()
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            📤 發送{documentTypeLabel}給客戶
          </DialogTitle>
          <DialogDescription>
            正在發送：<strong>{documentTitle}</strong>（{documentTypeLabel} #{documentId.slice(0, 8).toUpperCase()}）
          </DialogDescription>
        </DialogHeader>

        {sentResult ? (
          // ── 發送成功畫面 ──
          <div className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">發送完成！</h3>
            <p className="text-muted-foreground">
              已透過
              {sentResult.channels.includes("EMAIL") && " Email"}
              {sentResult.channels.includes("EMAIL") && sentResult.channels.includes("WHATSAPP") && " + "}
              {sentResult.channels.includes("WHATSAPP") && " WhatsApp"}
              {" "}發送給 <strong>{sentResult.customerName}</strong>
            </p>
            <Button onClick={() => onOpenChange(false)}>關閉</Button>
          </div>
        ) : selectedCustomer ? (
          // ── 選擇發送方式 ──
          <div className="space-y-6 py-4">
            {/* 已選客戶資訊 */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">已選擇客戶</h3>
              <p className="text-lg font-bold">{selectedCustomer.name || "未命名"}</p>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                {getEmail(selectedCustomer) && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {getEmail(selectedCustomer)}
                  </span>
                )}
                {getPhone(selectedCustomer) && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {getPhone(selectedCustomer)}
                  </span>
                )}
              </div>
            </div>

            {/* 選擇發送通道 */}
            <div>
              <h3 className="font-medium mb-3">選擇發送方式</h3>
              <div className="space-y-2">
                {getEmail(selectedCustomer) && (
                  <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-accent/50">
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes("EMAIL")}
                      onChange={() => toggleChannel("EMAIL")}
                      className="h-4 w-4"
                    />
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        發送到 {getEmail(selectedCustomer)}
                      </p>
                    </div>
                  </label>
                )}

                {getPhone(selectedCustomer) && (
                  <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-accent/50">
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes("WHATSAPP")}
                      onChange={() => toggleChannel("WHATSAPP")}
                      className="h-4 w-4"
                    />
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">
                        發送到 {getPhone(selectedCustomer)}
                      </p>
                    </div>
                  </label>
                )}

                {!getEmail(selectedCustomer) && !getPhone(selectedCustomer) && (
                  <p className="text-sm text-destructive">
                    此客戶沒有 Email 也沒有電話，無法發送
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                重新選擇客戶
              </Button>
              <Button
                onClick={handleSend}
                disabled={isPending || selectedChannels.length === 0}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                確認發送
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // ── 選擇客戶畫面 ──
          <div className="space-y-4 py-4">
            {/* 搜尋 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋客戶姓名、電話、Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            {/* 客戶列表 */}
            <div className="border rounded-md max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>姓名</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>電話</TableHead>
                    <TableHead className="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        找不到符合的客戶
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <TableCell className="font-medium">
                          {customer.name || "未命名"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getEmail(customer) || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getPhone(customer) || "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCustomer(customer)
                            }}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            選取
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <p className="text-xs text-muted-foreground">
              共 {filteredCustomers.length} 位客戶
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
