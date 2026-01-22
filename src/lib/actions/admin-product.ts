// // src/lib/actions/admin-product.ts
// 'use server';

// import { auth } from "@/lib/auth";
// import db from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { productSchema } from "../schemas/product";

// export async function createProduct(formData: FormData) {
//   console.log("=== createProduct 開始執行 ===");
//   // 用於除錯，看看前端傳了什麼進來
//   console.log("接收到的 FormData:", Object.fromEntries(formData));

//   try {
//     const session = await auth();
//     // 檢查是否登入且為 ADMIN
//     if (!session || session.user?.role !== "ADMIN") {
//       console.log("權限錯誤: 非 ADMIN");
//       return { success: false, error: "未授權操作" };
//     }
//     console.log("權限驗證通過，ADMIN:", session.user.id);

//     // --- 資料解析區 ---
//     const name = formData.get("name") as string;
//     const price = Number(formData.get("price"));
    
//     // 修正：確保留空時是 null 而非空字串 (加上 .trim() 去除空白)
//     const rawDesc = formData.get("description") as string;
//     const description = rawDesc?.trim() ? rawDesc : null;

//     // 重點修正：如果前端傳 'cat1' 會導致錯誤，這裡只做空值處理
//     // 獲取並處理所有可選的關聯 ID
//     const rawCat = formData.get("categoryId") as string;
//     const categoryId = rawCat?.trim() && rawCat !== "cat1" ? rawCat : null;

//     // ----- 新增以下處理 -----
//     const rawColor = formData.get("colorId") as string;
//     // 如果是 "col1" (假資料) 或 空字串，就強制轉成 null
//     const colorId = rawColor?.trim() && rawColor !== "col1" ? rawColor : null;

//     const rawSize = formData.get("sizeId") as string;
//     // 如果是 "sz1" (假資料) 或 空字串，就強制轉成 null
//     const sizeId = rawSize?.trim() && rawSize !== "sz1" ? rawSize : null;

//     const isFeatured = formData.get("isFeatured") === "true";
//     const isArchived = formData.get("isArchived") === "true";
//  console.log("處理後的 ID:", { categoryId, colorId, sizeId }); // Debug 看看
//     // 處理圖片
//     const images: string[] = [];
//     let i = 0;
//     while (formData.has(`images[${i}]`)) {
//       const url = formData.get(`images[${i}]`) as string;
//       if (url && url.trim() !== "") images.push(url);
//       i++;
//     }

//     // 建立產品
//     const newProduct = await db.product.create({
//       data: {
//         name,
//         description, // 使用上面處理過的值 (null 或 字串)
//         price,
//         isFeatured,
//         isArchived,
//         categoryId: categoryId, // 使用處理後的變數
//         colorId: colorId,       // ★ 改用處理後的變數
//         sizeId: sizeId,         // ★ 改用處理後的變數
//         images: {
//           create: images.map(url => ({ url })),
//         },
//       },
//       include: {
//         images: true,
//       },
//     });

//     console.log("✅ 產品建立成功！資料庫回傳:", newProduct);

//     revalidatePath("/dashboard/admin/products");
//     return { success: true, product: newProduct };

//   } catch (error: any) {
//     console.error("❌ 建立產品失敗:", error);

//     // --- 這裡是你最需要的修改 ---
//     // Prisma 錯誤代碼 P2003 代表：Foreign key constraint violated (關聯資料找不到)
//     if (error.code === 'P2003') {
//       // 根據錯誤訊息判斷是哪個欄位出錯
//       if (error.message.includes('categoryId')) {
//         return { success: false, error: "選擇的【分類】無效或不存在，請重新選擇。" };
//       }
//       if (error.message.includes('colorId')) {
//         return { success: false, error: "選擇的【顏色】無效或不存在。" };
//       }
//       if (error.message.includes('sizeId')) {
//         return { success: false, error: "選擇的【尺寸】無效或不存在。" };
//       }
//       // 通用的關聯錯誤
//       return { success: false, error: "嘗試關聯的資料(分類/顏色/尺寸)在資料庫中不存在。" };
//     }

//     return { success: false, error: error.message || "伺服器發生未知錯誤" };
//   }
// }
// // 更新產品
// // 引入 zod
// import { z } from "zod"; 

// export async function updateProduct(id: string, formData: FormData) {
//   const session = await auth();
//   if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

//   // 1. 手動提取並轉換資料
//   const name = formData.get("name") as string;
//   const description = formData.get("description") as string;
//   const priceRaw = formData.get("price") as string;

//   // 2. 建立一個專門用於「更新驗證」的簡單 Schema
//   // 我們用 z.coerce.number() 來自動把字串 "100" 轉成數字 100
//   const updateSchema = z.object({
//     name: z.string().min(1, "產品名稱為必填"),
//     description: z.string().optional(),
//     price: z.coerce.number().min(0, "價格不能小於 0"),
//   });

//   // 3. 驗證資料 (Safe Parse 不會崩潰，會告訴我們成功與否)
//   const validationResult = updateSchema.safeParse({
//     name,
//     description,
//     price: priceRaw, 
//   });

//   if (!validationResult.success) {
//     // 如果驗證失敗，印出錯誤以便除錯
//     console.error("驗證失敗:", validationResult.error.flatten());
//     throw new Error("輸入資料格式錯誤");
//   }

//   const { data } = validationResult;

//   // 4. 更新資料庫
//   // 注意：我們只更新這裡列出的欄位，不影響 category, images 等
//   await db.product.update({
//     where: { id },
//     data: {
//       name: data.name,
//       // 如果是空字串，存成 null 或保留空字串皆可，這裡設為空字串或原值
//       description: data.description || null, 
//       price: data.price,
//     },
//   });

//   revalidatePath("/admin/products");
//   // 建議加上這一行，確保單一產品頁面也更新
//   revalidatePath(`/admin/products/${id}`); 
// }

// // 刪除產品
// export async function deleteProduct(id: string) {
//   const session = await auth()
//   if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

//   await db.product.delete({
//     where: { id },
//   })

//   revalidatePath("/admin/products")
// }

// src/lib/actions/admin-product.ts
'use server'

import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
// import { Prisma } from "@prisma/client"

// 若未來需要完整表單驗證，可在此定義（目前先移除未使用的 productSchema）
// 若確定要用，可改為 export const createProductSchema = z.object({...})
// --- 在這裡定義 formSchema ---
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(), // 或 min(1) 看您的需求
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1),
  categoryId: z.string().optional().nullable(), // 允許為空
  colorId: z.string().optional().nullable(), // 允許為空
  sizeId: z.string().optional().nullable(),  // 允許為空
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});
// ----------------------------
const sanitizeId = (id: string | null | undefined) => {
  if (!id || id === "null" || id === "null_value" || id === "cat1" || id === "col1" || id === "sz1" || id.trim() === "") {
    return null;
  }
  return id;
};

export async function createProduct(values: z.infer<typeof formSchema>) {
  console.log("--- 開始執行 createProduct (String 模式) ---");

  // 1. Zod 驗證
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error("2. Zod 驗證失敗:", validatedFields.error);
    return { error: "欄位驗證失敗" };
  }

  // 解構資料
  const { 
    name, description, price, images, categoryId, 
    colorId, sizeId, isFeatured, isArchived 
  } = validatedFields.data;

  try {
    // 3. 準備寫入 DB 的資料
    const dbData = {
      name,
      description,
      price,
      isFeatured,
      isArchived,
      // 因為現在它們只是普通的 String? 欄位，直接賦值即可
      categoryId: sanitizeId(categoryId), 
      sizeId: sanitizeId(sizeId),
      colorId: sanitizeId(colorId),
      
      // 圖片仍然有關聯 (ProductImage[])，維持原樣
      images: {
        createMany: {
          data: [...images.map((image: { url: string }) => image)],
        },
      },
      
      // ⚠️ 關鍵修正：你的 Schema 沒有 storeId，這行必須刪掉，否則會報錯
      // storeId: "store_id_placeholder", 
    };

    console.log("3. 準備寫入 DB 的資料:", JSON.stringify(dbData, null, 2));

    // 4. 寫入資料庫
    const newProduct = await db.product.create({
      data: dbData,
    });

    console.log("4. DB 寫入成功! ID:", newProduct.id);
    
    revalidatePath(`/dashboard/products`);
    return { success: "Product created!" };

  } catch (error) {
    console.error("--- CREATE_PRODUCT_ERROR ---");
    console.error(error);
    return { error: "資料庫寫入發生錯誤" };
  }
}



export async function updateProduct(id: string, formData: FormData) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("未授權")
  }

  const updateSchema = z.object({
    name: z.string().min(1, "產品名稱為必填"),
    description: z.string().optional().nullable(),
    price: z.coerce.number().min(0, "價格不能小於 0"),
  })

  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string | null,
    price: formData.get("price") as string,
  }

  const validated = updateSchema.parse(rawData)

  await db.product.update({
    where: { id },
    data: {
      name: validated.name,
      description: validated.description,
      price: validated.price,
    },
  })

  revalidatePath("/dashboard/admin/products")
  revalidatePath(`/dashboard/admin/products/${id}`)

  return { success: true }
}

export async function deleteProduct(id: string) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("未授權")
  }

  await db.product.delete({ where: { id } })

  revalidatePath("/dashboard/admin/products")
}