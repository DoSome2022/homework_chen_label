// src/components/admin/CreateProductDialog.tsx
"use client";

import { UseFormReturn, SubmitHandler } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "../shared/ImageUploader";
// import { createProduct } from "@/lib/actions/admin-product";

// 產品表單資料型別（與 Zod schema 一致）
export interface ProductFormValues {
  name: string;
  price: number;
  description?: string;
  images: { url: string }[]; // 圖片為物件陣列，每個物件包含 url
  categoryId: string;
  colorId: string;
  sizeId: string;
  isFeatured: boolean;
  isArchived: boolean;
}

interface ProductFormProps {
  form: UseFormReturn<ProductFormValues>;
  onSubmit: SubmitHandler<ProductFormValues>;
  isSubmitting?: boolean;
  submitLabel?: string;
  categories: { id: string; name: string }[];
  colors: { id: string; name: string; value: string }[];
  sizes: { id: string; name: string; value: string }[];
}

export function CreateProductDialog({
  form,
  onSubmit,
  isSubmitting = false,
  submitLabel = "送出",
  categories,
  colors,
  sizes,
}: ProductFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        {/* 圖片上傳 */}
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>產品圖片（可多張）</FormLabel>
              <FormControl>
                <ImageUploader
                  value={field.value.map((image) => image.url)} // 轉為 string[] 給 ImageUploader
                  disabled={isSubmitting}
                  onChange={(newUrls: string[]) => {
                    // 將 string[] 轉回 { url: string }[] 格式，維持表單型別一致
                    const newImages = newUrls.map((url) => ({ url }));
                    field.onChange(newImages);
                  }}
                  onRemove={(urlToRemove: string) => {
                    // 移除指定 url 的圖片物件
                    field.onChange(
                      field.value.filter((image) => image.url !== urlToRemove)
                    );
                  }}
                />
              </FormControl>
              <FormDescription>
                支援 JPG、PNG、GIF、WebP 格式，單張上限 5MB
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 名稱與價格 - 並排顯示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>產品名稱</FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="請輸入產品名稱"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>價格</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={isSubmitting}
                    placeholder="例如：99.99"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 分類、尺寸、顏色 - 三欄並排 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>分類</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇分類" />
                    </SelectTrigger>
                  </FormControl>
<SelectContent>
  {/* 新增這個選項，value 設為特殊的空值標記或直接留空 */}
  <SelectItem value="null_value">無 / 未分類</SelectItem> 

  {categories.map((category) => (
    <SelectItem key={category.id} value={category.id}>
      {category.name}
    </SelectItem>
  ))}
</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sizeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>尺寸</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇尺寸" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="colorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>顏色</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇顏色" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.id} value={color.id}>
                        {color.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 開關設定 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start space-y-0 rounded-md border p-4">
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>精選商品</FormLabel>
                  <FormDescription>此商品將顯示於首頁推薦</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isArchived"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>封存商品</FormLabel>
                  <FormDescription>封存後此商品將不顯示於商店</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* 商品描述 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>商品描述</FormLabel>
              <FormControl>
                <Textarea
                  className="resize-none min-h-[120px]"
                  disabled={isSubmitting}
                  placeholder="請輸入商品的詳細描述、特色、規格等資訊..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                詳細的描述有助於提升商品曝光與轉換率
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 提交按鈕 */}
        <div className="flex justify-end">
          <Button
            disabled={isSubmitting}
            type="submit"
            className="min-w-[120px]"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}