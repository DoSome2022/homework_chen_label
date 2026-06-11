// // src/app/layout.tsx
// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { Toaster } from "@/components/ui/sonner"
// import { SessionProvider } from "next-auth/react";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "標緻商標印刷有限公司",
//   description: "標緻商標印刷有限公司",
// };

// // ✅ 全域變數：確保 cron job 在 Server 端只啟動一次（避免 hot reload 重複註冊）
// const globalForCron = globalThis as typeof globalThis & { __cronStarted?: boolean }

// if (typeof window === "undefined" && !globalForCron.__cronStarted) {
//   globalForCron.__cronStarted = true

//   // 動態 import，避免模組在客戶端被載入
//   import("@/lib/cron").then(({ startScheduledJobs }) => {
//     startScheduledJobs()
//     console.log("[Cron] 排程任務已成功啟動")
//   }).catch((err) => {
//     console.error("[Cron] 啟動失敗:", err)
//   })
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <SessionProvider>
//           {children}
//           <Toaster />
//         </SessionProvider>          
//       </body>
//     </html>
//   );
// }



// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "next-auth/react";
import { LangProvider } from "@/components/context/LangContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "標緻商標印刷有限公司",
  description: "標緻商標印刷有限公司",
};

// ✅ 全域變數：確保 cron job 在 Server 端只啟動一次
const globalForCron = globalThis as typeof globalThis & { __cronStarted?: boolean }

if (typeof window === "undefined" && !globalForCron.__cronStarted) {
  globalForCron.__cronStarted = true

  import("@/lib/cron").then(({ startScheduledJobs }) => {
    startScheduledJobs()
    console.log("[Cron] 排程任務已成功啟動")
  }).catch((err) => {
    console.error("[Cron] 啟動失敗:", err)
  })
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <LangProvider>
            {children}
            <Toaster />
          </LangProvider>
        </SessionProvider>          
      </body>
    </html>
  );
}
