"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateProduct } from "@/lib/actions/admin-product";

// 定義可編輯的產品型別（與 ProductTable 傳遞的 Pick 一致）
type EditableProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string | null;     // 注意：這裡使用 categoryId 而非 category string
  colorId: string | null;
  sizeId: string | null;
  isFeatured: boolean;
  isArchived: boolean;
  // 若 updateProduct 需要 stock / imageUrl / status，可在查詢時補齊，或在 action 處理
  // stock?: number;
  // imageUrl?: string | null;
  // status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
};

interface EditProductDialogProps {
  product: EditableProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
}: EditProductDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      await updateProduct(product.id, formData);

      toast.success("成功", {
        description: "產品已更新",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Update product error:", error);
      toast.error("失敗", {
        description: error instanceof Error ? error.message : "更新產品時發生錯誤",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>編輯產品</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 產品名稱 */}
          <div className="space-y-2">
            <Label htmlFor="name">名稱</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product.name}
              required
            />
          </div>

          {/* 分類：使用 categoryId，但表單送 category（需在 action 處理） */}
          <div className="space-y-2">
            <Label htmlFor="category">分類</Label>
            <Select name="category" defaultValue={product.categoryId ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder="選擇分類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TENT">帳篷</SelectItem>
                <SelectItem value="FURNITURE">家具</SelectItem>
                <SelectItem value="LIGHTING">燈具</SelectItem>
                <SelectItem value="COOKING">炊具</SelectItem>
                <SelectItem value="ACCESSORIES">配件</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 價格與庫存（若無 stock，可移除或預設 0） */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">價格</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"  // 若 price 是 Decimal，建議加上 step
                defaultValue={product.price}
                required
              />
            </div>

            {/* 若 Prisma 有 stock 欄位，請在查詢時 include；這裡先註解 */}
            {/* <div className="space-y-2">
              <Label htmlFor="stock">庫存</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                defaultValue={product.stock ?? 0}
                required
              />
            </div> */}
          </div>

          {/* 狀態（若 Prisma schema 使用 isArchived 代替 status，可調整） */}
          <div className="space-y-2">
            <Label htmlFor="status">狀態</Label>
            <Select 
              name="status" 
              defaultValue={product.isArchived ? "ARCHIVED" : "ACTIVE"}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇狀態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">上架中</SelectItem>
                <SelectItem value="INACTIVE">下架中</SelectItem>
                <SelectItem value="ARCHIVED">已封存</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product.description || ""}
            />
          </div>

          {/* 圖片上傳 */}
          <div className="space-y-2">
            <Label htmlFor="image">圖片 (選填)</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
            />
            {/* 若未來有 imageUrl，可顯示預覽 */}
            {/* {product.imageUrl && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">
                  目前圖片：
                </p>
                <img 
                  src={product.imageUrl} 
                  alt="Current product" 
                  className="mt-1 h-20 w-20 object-cover rounded"
                />
              </div>
            )} */}
            <p className="text-xs text-muted-foreground mt-1">
              若不上傳新圖片，將保留原有圖片
            </p>
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "儲存中..." : "儲存變更"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}