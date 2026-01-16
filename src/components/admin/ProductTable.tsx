'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Pencil } from "lucide-react"  // ← 新增 Pencil 圖示（可選）
import { useRouter, useSearchParams } from "next/navigation"
import { deleteProduct } from "@/lib/actions/admin-product"
import { Trash2 } from "lucide-react"
import { Product } from "@prisma/client"
import { EditProductDialog } from "./EditProductDialog"
import { useState } from "react"

interface ProductTableProps {
  products: Pick<
    Product,
    | "id"
    | "name"
    | "description"
    | "price"
    | "createdAt"
    | "updatedAt"
    | "categoryId"
    | "colorId"
    | "sizeId"
    | "isFeatured"
    | "isArchived"
  >[]
  currentSort: "name" | "price" | "createdAt"
  currentOrder: "asc" | "desc"
}

export function ProductTable({ products, currentSort, currentOrder }: ProductTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 單一狀態：記錄目前正在編輯的產品 ID（null 表示沒有任何對話框開啟）
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  const toggleSort = (field: "name" | "price" | "createdAt") => {
    const params = new URLSearchParams(searchParams.toString())
    const newOrder = currentSort === field && currentOrder === "asc" ? "desc" : "asc"
    params.set("sort", field)
    params.set("order", newOrder)
    router.push(`?${params.toString()}`)
  }

  const getSortIcon = (field: string) => {
    if (currentSort !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />
    return currentOrder === "asc" ? " ↑" : " ↓"
  }

  // 開啟編輯對話框
  const handleOpenEdit = (productId: string) => {
    setEditingProductId(productId)
  }

  // 關閉編輯對話框
  const handleCloseEdit = () => {
    setEditingProductId(null)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => toggleSort("name")}
              className="flex items-center hover:bg-transparent"
            >
              產品名稱 {getSortIcon("name")}
            </Button>
          </TableHead>
          <TableHead>描述</TableHead>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => toggleSort("price")}
              className="flex items-center hover:bg-transparent"
            >
              價格 {getSortIcon("price")}
            </Button>
          </TableHead>
          <TableHead>建立日期</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {products.map((product) => {
          const isEditing = editingProductId === product.id

          return (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="max-w-xs truncate">
                {product.description || "-"}
              </TableCell>
              <TableCell>
                ${Number(product.price).toFixed(2)}
              </TableCell>
              <TableCell>
                {new Date(product.createdAt).toLocaleDateString("zh-TW")}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {/* 編輯按鈕 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(product.id)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  編輯
                </Button>

                {/* 只有當正在編輯此產品時，才渲染對話框 */}
                {isEditing && (
                  <EditProductDialog
                    product={product}
                    open={true}
                    onOpenChange={(open) => {
                      // 當使用者關閉對話框時，重設狀態
                      if (!open) {
                        handleCloseEdit()
                      }
                    }}
                  />
                )}

                {/* 刪除表單 */}
                <form action={deleteProduct.bind(null, product.id)} className="inline">
                  <Button type="submit" variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}