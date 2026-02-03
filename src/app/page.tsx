'use client';
import Image from 'next/image';
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import Nav from '@/components/nav';

export default function LabelPrintingCompany() {
const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role
      if (role === "ADMIN") router.push("/dashboard")
      else if (role === "EMPLOYEE") router.push("/dashboard")
      else if (role === "CUSTOMER") router.push("/dashboard")
    }
  }, [status, session, router])

  if (status === "loading") return <div>載入中...</div>

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* 導航欄 */}
      <Nav/>

      {/* 主內容區 */}
      <main className="w-3/4 lg:w-2/4 mx-auto px-10 py-12">
        {/* 產品圖片展示 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 relative group">
          <Image 
            src="/m1.png"
            alt="標籤樣式1" 
            width={600}  // 原始圖片寬度
              height={600} // 原始圖片高度
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
            className="w-full h-auto object-cover aspect-square group-hover:opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-60">
            <p className="text-white text-lg font-semibold p-4">
              我們提供「一對一」報價服務，跟進您每一個要求！
            </p>
          </div>
          <Image 
            src="/m2.png"
            alt="標籤樣式2" 
              width={600}  // 原始圖片寬度
  height={600} // 原始圖片高度
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
            className="w-full h-auto object-cover aspect-square"
          />
          <Image 
            src="/m1.png"
            alt="標籤樣式3" 
              width={600}  // 原始圖片寬度
  height={600} // 原始圖片高度
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
            className="hidden sm:grid w-full h-auto object-cover aspect-square opacity-20"
          />
          <Image 
            src="/m2.png"
            alt="標籤樣式4" 
              width={600}  // 原始圖片寬度
  height={600} // 原始圖片高度
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
            className="hidden sm:grid w-full h-auto object-cover aspect-square opacity-20"
          />
          <Image 
            src="/m3.png"
            alt="標籤樣式5" 
              width={600}  // 原始圖片寬度
  height={600} // 原始圖片高度
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
            className="w-full h-auto object-cover aspect-square"
          />
          <Image 
            src="/m4.png"
            alt="標籤樣式6" 
              width={600}  // 原始圖片寬度
  height={600} // 原始圖片高度
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
            className="w-full h-auto object-cover aspect-square"
          />
          <Image 
            src="/m3.png"
            alt="標籤樣式7" 
              width={600}  // 原始圖片寬度
  height={600} // 原始圖片高度
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
            className="hidden sm:grid w-full h-auto object-cover aspect-square opacity-20"
          />
          <Image 
            src="/m4.png"
            alt="標籤樣式8" 
              width={600}  // 原始圖片寬度
  height={600} // 原始圖片高度
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
            className="hidden sm:grid w-full h-auto object-cover aspect-square opacity-20"
          />
        </div>

        {/* 公司標題 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">BEAUTY LABEL PRINTING COMPANY</h1>
          <h2 className="text-xl text-gray-700 mt-1">標緻商標印刷有限公司</h2>
        </div>

        {/* 公司介紹 */}
        <section className="mb-8">
          <p className="text-center text-gray-700 text-sm leading-relaxed">
            BEAUTY LABEL PRINTING COMPANY 標籤製造是一家專注於標籤研發與生產的企業，擁有多年行業經驗，專為品牌客戶提供高品質洗水標、尺碼標、成分標等標籤產品。
          </p>
        </section>

        {/* 我們的業務 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">我們的業務</h3>
          <div className="max-w-md mx-auto text-sm text-gray-700">
            <p className="mb-2">• 我們生產以下標籤類型：</p>
            <p className="ml-4 mb-2">服飾類：品牌標、尺碼標、成分標、洗水標</p>
            <p className="ml-4 mb-2">鞋類：產地標、規格標、追溯標籤</p>
            <p className="mb-2">• 定製服務：可根據客戶需求定製材質、印刷內容、工藝細節</p>
          </div>
        </section>

        {/* 生產流程 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">生產流程</h3>
          <div className="max-w-md mx-auto text-sm text-gray-700 leading-relaxed">
            <p className="mb-1">我們以標準化流程保障交期與品質：</p>
            <p className="ml-4 mb-1">出辦：根據客戶設計 / 需求，快速打樣確認細節</p>
            <p className="ml-4 mb-1">加工：樣品確認後，啟動原材料加工與工藝預製</p>
            <p className="ml-4 mb-1">大貨：批量生產前的物料備貨與品質檢測</p>
            <p className="ml-4 mb-1">流水線生產：標準化車間流水線作業，保障產能與一致性</p>
          </div>
        </section>

        {/* 為什麼選擇我們？ */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">為什麼選擇我們？</h3>
          <div className="max-w-md mx-auto text-sm text-gray-700">
            <p className="ml-4 mb-1">行業專注：更懂品牌客戶的品質與工藝需求</p>
            <p className="ml-4 mb-1">效率保障：出辦快、大貨交期穩，流水線產能覆蓋中小批量到大宗訂單</p>
          </div>
        </section>
      </main>
    </div>
  );
}