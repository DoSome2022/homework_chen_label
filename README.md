26/1/2026

改了google login
上圖圖片對話(客同員工)
加了截止日期 員工
admin 加了建立聯絡資訊

2/2/2026

加驗證碼登入

9/5/2026

改了session undefined問題
改了client 的message 問題

6/6/2026

在廣播中 加了 申請鍵
之後 再等報告ui 即可


11/6/2026

加了很多東西 可delploy
修了bug （可以這樣說吧）


12/6/2026
又又又改了東西



21/6/2026

要改 db火燒連環計

## 修復記錄 - 2026-06-21

### 修復 1：Cron + revalidatePath 分離
- **問題**：Cron 任務中呼叫 revalidatePath 導致錯誤
- **解決**：拆分為 Core/User/Cron 三個函數
- **檔案**：
  - src/lib/actions/daily-promotion.ts
  - src/lib/cron/index.ts
  - src/components/admin/DailyPromotionSection.tsx

### 修復 2：BroadcastForm 檔案上傳
- **問題**：react-hook-form 中檔案上傳不穩定
- **解決**：使用 useRef 替代從事件取得檔案
- **檔案**：src/components/admin/BroadcastForm.tsx

### 修復 3：createBroadcast 錯誤處理
- **問題**：sendBroadcastToAllCustomers 錯誤未被妥善記錄
- **解決**：使用 void + 完整錯誤物件記錄
- **檔案**：src/lib/actions/admin-broadcast.ts

### 修復 4：頁面錯誤邊界
- **問題**：資料庫查詢失敗時頁面崩潰
- **解決**：加入 error.tsx + loading.tsx + try-catch
- **檔案**：
  - src/app/(dashboard)/admin/broadcasts/error.tsx (新增)
  - src/app/(dashboard)/admin/broadcasts/loading.tsx (新增)
  - src/components/ui/skeleton.tsx (新增)
  - src/app/(dashboard)/admin/broadcasts/page.tsx

### 修復 5：使用 revalidateTag
- **問題**：revalidatePath 不夠精確且在 Cron 中易報錯
- **解決**：改用 revalidateTag + 定義 CACHE_TAGS 常數
- **檔案**：
  - src/lib/actions/admin-broadcast.ts
  - src/lib/actions/daily-promotion.ts



  以過 run build 可deploy