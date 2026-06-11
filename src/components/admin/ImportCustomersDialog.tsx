// src/components/admin/ImportCustomersDialog.tsx
"use client"

import { useState, useRef, useTransition } from "react"
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { importCustomers } from "@/lib/actions/import-customers"
import { Upload, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Papa from "papaparse"

// ✅ 定義 CSV 匯入的資料型別
type CsvCustomerRow = {
  name: string
  email: string
  password: string
  phone?: string
  customerType?: "NORMAL" | "POTENTIAL"
}

export function ImportCustomersDialog() {
  const [open, setOpen] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{
    success: number
    skipped: number
    errors: { row: number; reason: string }[]
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setCsvText(text)
    }
    reader.readAsText(file)

    // 清空 input，允許重複上傳同檔案
    e.target.value = ""
  }

  const handleImport = async () => {
    if (!csvText.trim()) {
      toast.error("請先貼上 CSV 資料或上傳檔案")
      return
    }

    // 用 PapaParse 解析
    const parsed = Papa.parse<CsvCustomerRow>(csvText.trim(), {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
    })


    if (parsed.errors.length > 0) {
      toast.error(`CSV 格式錯誤：${parsed.errors[0].message}`)
      return
    }

    if (parsed.data.length === 0) {
      toast.error("沒有找到任何資料")
      return
    }

    // 限制一次最多 500 筆（防呆）
    if (parsed.data.length > 500) {
      toast.error("一次最多匯入 500 筆，請分批處理")
      return
    }

    startTransition(async () => {
      const res = await importCustomers(parsed.data)
      setResult(res)

      if (res.errors.length === 0) {
        toast.success(`成功匯入 ${res.success} 位客戶！`)
      } else if (res.success > 0) {
        toast.success(`成功 ${res.success} 筆，失敗 ${res.errors.length} 筆，請查看詳情`)
      } else {
        toast.error(`匯入失敗，請查看錯誤詳情`)
      }
    })
  }

  const resetAll = () => {
    setCsvText("")
    setResult(null)
    setOpen(false)
  }

  // 範例 CSV 文字
  const exampleCSV = `name,email,password,phone,customerType
王小明,test@test.com,123456,0912345678,NORMAL
李大華,li@test.com,123456,0933111222,POTENTIAL`

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) resetAll()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          匯入客戶
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>批量匯入客戶</DialogTitle>
          <DialogDescription>
            上傳 CSV 檔案，或直接貼上從 Excel/Google Sheets 複製的資料。
            欄位順序：<strong>name, email, password, phone, customerType</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 上傳按鈕 */}
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              選擇 CSV 檔案
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            <span className="text-sm text-muted-foreground">
              或直接在下框貼上資料
            </span>
          </div>

          {/* CSV 資料貼上區 */}
          <Textarea
            placeholder={exampleCSV}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />

          {/* 匯入結果 */}
          {result && (
            <div className="space-y-2">
              <Alert variant={result.errors.length === 0 ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    成功：{result.success} 筆
                    {result.errors.length > 0 && (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        失敗：{result.errors.length} 筆
                      </>
                    )}
                  </span>
                </AlertTitle>
                <AlertDescription>
                  共處理 {result.success + result.errors.length} 筆資料
                </AlertDescription>
              </Alert>

              {result.errors.length > 0 && (
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                  <p className="text-sm font-medium mb-2 text-destructive">錯誤明細：</p>
                  <ul className="text-sm space-y-1">
                    {result.errors.map((err, idx) => (
                      <li key={idx} className="text-muted-foreground">
                        第 {err.row} 行：{err.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAll}>
            {result ? "關閉" : "取消"}
          </Button>
          {!result && (
            <Button onClick={handleImport} disabled={isPending || !csvText.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              開始匯入
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
