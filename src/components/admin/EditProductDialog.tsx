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
import { ProductImage } from "@prisma/client";

// 定義可編輯的產品型別（加入成本欄位）
type EditableProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string | null;
  colorId: string | null;
  sizeId: string | null;
  isFeatured: boolean;
  isArchived: boolean;
  images: ProductImage[];
  // ⭐ 新增成本欄位
  costPrice: number | null;
  materialCost: number | null;
  laborCost: number | null;
  otherCost: number | null;
  supplier: string | null;
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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

          {/* 分類 */}
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

          {/* 價格 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">價格</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={product.price}
                required
              />
            </div>
          </div>

          {/* ⭐ 成本設定區塊 */}
          <div className="border rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                💰 成本設定（供報告分析用）
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">總成本價</Label>
                <Input
                  id="costPrice"
                  name="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.costPrice ?? ""}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">供應商</Label>
                <Input
                  id="supplier"
                  name="supplier"
                  defaultValue={product.supplier ?? ""}
                  placeholder="供應商名稱"
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground border-t pt-2">
              或填寫以下細項成本（總成本 = 物料 + 人工 + 其他）
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="materialCost">物料成本</Label>
                <Input
                  id="materialCost"
                  name="materialCost"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.materialCost ?? ""}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="laborCost">人工成本</Label>
                <Input
                  id="laborCost"
                  name="laborCost"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.laborCost ?? ""}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherCost">其他成本</Label>
                <Input
                  id="otherCost"
                  name="otherCost"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product.otherCost ?? ""}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* 狀態 */}
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
