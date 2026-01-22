// src/components/admin/ProductManagement.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateProductDialog, ProductFormValues } from "./CreateProductDialog";
import { createProduct } from "@/lib/actions/admin-product";

// 臨時靜態資料（之後您可以改成從資料庫讀取）
const mockCategories = [
  { id: "cat1", name: "電子產品" },
  { id: "cat2", name: "服飾" },
  { id: "cat3", name: "家居" },
];

const mockColors = [
  { id: "col1", name: "紅色", value: "#ff0000" },
  { id: "col2", name: "藍色", value: "#0000ff" },
];

const mockSizes = [
  { id: "sz1", name: "S", value: "S" },
  { id: "sz2", name: "M", value: "M" },
  { id: "sz3", name: "L", value: "L" },
];

// Zod 驗證規則（與 ProductFormValues 完全一致）
const formSchema = z.object({
  name: z.string().min(1, "請輸入產品名稱"),
  price: z.number().min(0, "價格不可小於 0"),
  description: z.string().optional(),
  images: z.array(z.object({ url: z.string().url() })).min(1, "請至少上傳一張圖片"),
  categoryId: z.string().min(1, "請選擇分類"),
  colorId: z.string().min(1, "請選擇顏色"),
  sizeId: z.string().min(1, "請選擇尺寸"),
  isFeatured: z.boolean(),
  isArchived: z.boolean(),
});

export function ProductManagement() {
  const [open, setOpen] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      images: [],
      categoryId: "",
      colorId: "",
      sizeId: "",
      isFeatured: false,
      isArchived: false,
    },
  });

// ProductManagement.tsx 的 onSubmit
// 假設你用的是 react-hook-form 的 handleSubmit
const onSubmit = async (data: ProductFormValues) => {
  try {
    // 整理資料
    const formattedData = {
      ...data,
      price: Number(data.price),
  categoryId: (data.categoryId === "cat1" || !data.categoryId) ? null : data.categoryId,
  colorId: (data.colorId === "col1" || !data.colorId) ? null : data.colorId,
  sizeId: (data.sizeId === "sz1" || !data.sizeId) ? null : data.sizeId,
    };

    // --- 修改開始 ---
    console.log("前端送出的資料:", formattedData);

    // 呼叫 Server Action 並等待結果
    const result = await createProduct(formattedData);

    // 檢查是否有錯誤
    if (result.error) {
      console.error("後端回傳錯誤:", result.error);
      alert(`建立失敗: ${result.error}`); // 或者用 toast.error
      return; // 發生錯誤就停在這裡，不要關閉視窗
    }

    // 成功才執行這些
    console.log("建立成功:", result.success);
    setOpen(false);
    form.reset();
    // --- 修改結束 ---

  } catch (error) {
    console.error("前端未知錯誤:", error);
    alert("發生意外錯誤");
  }
};



  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold">產品管理</h1>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>新增產品</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>建立新產品</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <CreateProductDialog
              form={form}
              onSubmit={onSubmit}
              isSubmitting={form.formState.isSubmitting}
              submitLabel="建立產品"
              categories={mockCategories}
              colors={mockColors}
              sizes={mockSizes}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}