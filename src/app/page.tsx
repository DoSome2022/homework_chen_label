// 'use client';
// import Image from 'next/image';
// import { useSession } from "next-auth/react"
// import { useRouter } from "next/navigation"
// import { useEffect } from "react"

// import Nav from '@/components/nav';

// export default function LabelPrintingCompany() {
// const { data: session, status } = useSession()
//   const router = useRouter()

//   useEffect(() => {
//     if (status === "authenticated" && session?.user?.role) {
//       const role = session.user.role
//       if (role === "ADMIN") router.push("/dashboard")
//       else if (role === "EMPLOYEE") router.push("/dashboard")
//       else if (role === "CUSTOMER") router.push("/dashboard")
//     }
//   }, [status, session, router])

//   if (status === "loading") return <div>載入中...</div>

//   return (
//     <div className="min-h-screen bg-white text-gray-800">
//       {/* 導航欄 */}
//       <Nav/>

//       {/* 主內容區 */}
//       <main className="w-3/4 lg:w-2/4 mx-auto px-10 py-12">
//         {/* 產品圖片展示 */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 relative group">
//           <Image 
//             src="/m1.png"
//             alt="標籤樣式1" 
//             width={600}  // 原始圖片寬度
//               height={600} // 原始圖片高度
//   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
//             className="w-full h-auto object-cover aspect-square group-hover:opacity-50"
//           />
//           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-60">
//             <p className="text-white text-lg font-semibold p-4">
//               我們提供「一對一」報價服務，跟進您每一個要求！
//             </p>
//           </div>
//           <Image 
//             src="/m2.png"
//             alt="標籤樣式2" 
//               width={600}  // 原始圖片寬度
//   height={600} // 原始圖片高度
//   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
//             className="w-full h-auto object-cover aspect-square"
//           />
//           <Image 
//             src="/m1.png"
//             alt="標籤樣式3" 
//               width={600}  // 原始圖片寬度
//   height={600} // 原始圖片高度
//   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
//             className="hidden sm:grid w-full h-auto object-cover aspect-square opacity-20"
//           />
//           <Image 
//             src="/m2.png"
//             alt="標籤樣式4" 
//               width={600}  // 原始圖片寬度
//   height={600} // 原始圖片高度
//   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
//             className="hidden sm:grid w-full h-auto object-cover aspect-square opacity-20"
//           />
//           <Image 
//             src="/m3.png"
//             alt="標籤樣式5" 
//               width={600}  // 原始圖片寬度
//   height={600} // 原始圖片高度
//   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
//             className="w-full h-auto object-cover aspect-square"
//           />
//           <Image 
//             src="/m4.png"
//             alt="標籤樣式6" 
//               width={600}  // 原始圖片寬度
//   height={600} // 原始圖片高度
//   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
//             className="w-full h-auto object-cover aspect-square"
//           />
//           <Image 
//             src="/m3.png"
//             alt="標籤樣式7" 
//               width={600}  // 原始圖片寬度
//   height={600} // 原始圖片高度
//   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
//             className="hidden sm:grid w-full h-auto object-cover aspect-square opacity-20"
//           />
//           <Image 
//             src="/m4.png"
//             alt="標籤樣式8" 
//               width={600}  // 原始圖片寬度
//   height={600} // 原始圖片高度
//   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
//             className="hidden sm:grid w-full h-auto object-cover aspect-square opacity-20"
//           />
//         </div>

//         {/* 公司標題 */}
//         <div className="text-center mb-8">
//           <h1 className="text-2xl font-bold text-gray-900">BEAUTY LABEL PRINTING COMPANY</h1>
//           <h2 className="text-xl text-gray-700 mt-1">標緻商標印刷有限公司</h2>
//         </div>

//         {/* 公司介紹 */}
//         <section className="mb-8">
//           <p className="text-center text-gray-700 text-sm leading-relaxed">
//             BEAUTY LABEL PRINTING COMPANY 標籤製造是一家專注於標籤研發與生產的企業，擁有多年行業經驗，專為品牌客戶提供高品質洗水標、尺碼標、成分標等標籤產品。
//           </p>
//         </section>

//         {/* 我們的業務 */}
//         <section className="mb-8">
//           <h3 className="text-lg font-semibold text-gray-800 mb-2">我們的業務</h3>
//           <div className="max-w-md mx-auto text-sm text-gray-700">
//             <p className="mb-2">• 我們生產以下標籤類型：</p>
//             <p className="ml-4 mb-2">服飾類：品牌標、尺碼標、成分標、洗水標</p>
//             <p className="ml-4 mb-2">鞋類：產地標、規格標、追溯標籤</p>
//             <p className="mb-2">• 定製服務：可根據客戶需求定製材質、印刷內容、工藝細節</p>
//           </div>
//         </section>

//         {/* 生產流程 */}
//         <section className="mb-8">
//           <h3 className="text-lg font-semibold text-gray-800 mb-2">生產流程</h3>
//           <div className="max-w-md mx-auto text-sm text-gray-700 leading-relaxed">
//             <p className="mb-1">我們以標準化流程保障交期與品質：</p>
//             <p className="ml-4 mb-1">出辦：根據客戶設計 / 需求，快速打樣確認細節</p>
//             <p className="ml-4 mb-1">加工：樣品確認後，啟動原材料加工與工藝預製</p>
//             <p className="ml-4 mb-1">大貨：批量生產前的物料備貨與品質檢測</p>
//             <p className="ml-4 mb-1">流水線生產：標準化車間流水線作業，保障產能與一致性</p>
//           </div>
//         </section>

//         {/* 為什麼選擇我們？ */}
//         <section>
//           <h3 className="text-lg font-semibold text-gray-800 mb-2">為什麼選擇我們？</h3>
//           <div className="max-w-md mx-auto text-sm text-gray-700">
//             <p className="ml-4 mb-1">行業專注：更懂品牌客戶的品質與工藝需求</p>
//             <p className="ml-4 mb-1">效率保障：出辦快、大貨交期穩，流水線產能覆蓋中小批量到大宗訂單</p>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }

'use client';
import Image from 'next/image';
import Link from 'next/link';

import Nav from '../components/nav'
import m1 from '../../public/m1.png'
import m2 from '../../public/m2.png'
import m3 from '../../public/m3.png'
import m4 from '../../public/m4.png'
import { useLang } from '@/components/context/LangContext';

export default function LabelPrintingCompany() {
  const { lang } = useLang();

  // 全站雙語文案（新增註冊按鈕文字）
  const content = {
    zh: {
      tip: '提供一對一專屬報價，全程跟進您的所有需求！',
      companyName: '標緻商標印刷有限公司',
      companySub: '專業服飾標籤製作',
      intro: '標緻商標印刷深耕標籤研發與生產領域，累積多年行業實務經驗，專為各大品牌客戶提供高品質水洗標、尺碼標、成分標等各式服飾標籤。',
      business: '營業項目',
      businessDesc: '主要生產標籤類別：',
      clothLabel: '服飾類：品牌織標、尺碼標、成分標、水洗標',
      shoeLabel: '鞋類配件：產地標、規格標、溯源標籤',
      custom: '客製服務：依客戶需求定制材質、印刷內容與工藝細節',
      process: '生產作業流程',
      processDesc: '標準化作業流程，嚴格把關交期與產品品質：',
      sample: '打樣：依照客戶設計圖與需求，快速製作樣品確認細節',
      prepare: '備料：樣品確認後，啟用原料準備與工藝前置作業',
      check: '檢驗：批量生產前完成物料檢測與品質把關',
      mass: '量產：車間流水線標準作業，穩定產能與產品品質',
      advantage: '選擇我們的優勢',
      adv1: '專業深耕：熟悉品牌需求，工藝與品質更有保障',
      adv2: '高效穩定：打樣速度快、交期準時，承接大小批量訂單',
      imgAlt: '標籤款式',
      registerBtn: '立即註冊成為會員！即享會員優惠！'
    },
    en: {
      tip: 'One-on-one quotation service, follow up all your requirements!',
      companyName: 'BEAUTY LABEL PRINTING COMPANY',
      companySub: 'Professional Garment Label Manufacturer',
      intro: 'We focus on label R&D and production with years of industry experience. We provide high-quality care labels, size labels, content labels and various garment labels for brand clients.',
      business: 'Our Business',
      businessDesc: 'Main label products:',
      clothLabel: 'Garment: Woven label, size label, content label, care label',
      shoeLabel: 'Shoes: Origin label, specification label, traceability label',
      custom: 'Custom service: Custom material, printing content and craft details',
      process: 'Production Process',
      processDesc: 'Standardized process to ensure delivery and quality:',
      sample: 'Sampling: Make samples quickly according to your design and requirements',
      prepare: 'Material preparation: Prepare raw materials after sample confirmation',
      check: 'Inspection: Strict quality inspection before mass production',
      mass: 'Mass production: Standard assembly line for stable output & quality',
      advantage: 'Why Choose Us',
      adv1: 'Professional experience: Deep understanding of brand quality & craft',
      adv2: 'Reliable efficiency: Fast sampling & on-time delivery for all orders',
      imgAlt: 'Label Style',
      registerBtn: 'Register now to become a member! Get more discount!'
    }
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Nav />

      <main className="w-3/4 lg:w-2/4 mx-auto px-10 py-12">
        {/* 產品圖片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 relative group">
          <Image
            src={m1}
            alt={`${t.imgAlt} 1`}
            className="w-full h-auto object-cover aspect-square group-hover:opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-60">
            <p className="text-white text-lg font-semibold p-4">
              {t.tip}
            </p>
          </div>
          <Image
            src={m2}
            alt={`${t.imgAlt} 2`}
            className="w-full h-auto object-cover aspect-square"
          />
          <Image
            src={m1}
            alt={`${t.imgAlt} 3`}
            className="hidden sm:grid w-full h-auto object-cover aspect-square opacity-20"
          />
          <Image
            src={m2}
            alt={`${t.imgAlt} 4`}
            className="hidden sm:grid w-full h-auto object-cover aspect-square opacity-20"
          />
          <Image
            src={m3}
            alt={`${t.imgAlt} 5`}
            className="w-full h-auto object-cover aspect-square"
          />
          <Image
            src={m4}
            alt={`${t.imgAlt} 6`}
            className="w-full h-auto object-cover aspect-square"
          />
          <Image
            src={m3}
            alt={`${t.imgAlt} 7`}
            className="hidden sm:grid w-full h-auto object-cover aspect-square opacity-20"
          />
          <Image
            src={m4}
            alt={`${t.imgAlt} 8`}
            className="hidden sm:grid w-full h-auto object-cover aspect-square opacity-20"
          />
        </div>

        {/* 公司標題 + 註冊按鈕 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t.companyName}</h1>
          <h2 className="text-xl text-gray-700 mt-1">{t.companySub}</h2>

          {/* 註冊引導按鈕 */}
          <Link
            href="/register"
            className="inline-block mt-4 px-8 py-2.5 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 transition-colors duration-200 
                       font-medium shadow-md hover:shadow-lg"
          >
            {t.registerBtn}
          </Link>
        </div>

        {/* 公司介紹 */}
        <section className="mb-8">
          <p className="text-center text-gray-700 text-sm leading-relaxed">
            {t.intro}
          </p>
        </section>

        {/* 我們的業務 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.business}</h3>
          <div className="max-w-md mx-auto text-sm text-gray-700">
            <p className="mb-2">• {t.businessDesc}</p>
            <p className="ml-4 mb-2">{t.clothLabel}</p>
            <p className="ml-4 mb-2">{t.shoeLabel}</p>
            <p className="mb-2">• {t.custom}</p>
          </div>
        </section>

        {/* 生產流程 */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.process}</h3>
          <div className="max-w-md mx-auto text-sm text-gray-700 leading-relaxed">
            <p className="mb-1">{t.processDesc}</p>
            <p className="ml-4 mb-1">{t.sample}</p>
            <p className="ml-4 mb-1">{t.prepare}</p>
            <p className="ml-4 mb-1">{t.check}</p>
            <p className="ml-4 mb-1">{t.mass}</p>
          </div>
        </section>

        {/* 優勢 */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.advantage}</h3>
          <div className="max-w-md mx-auto text-sm text-gray-700">
            <p className="ml-4 mb-1">{t.adv1}</p>
            <p className="ml-4 mb-1">{t.adv2}</p>
          </div>
        </section>
      </main>
    </div>
  );
}