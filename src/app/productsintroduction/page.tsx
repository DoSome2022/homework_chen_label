'use client';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../components/nav'

import p1 from '../../../public/p1.png'
import p2 from '../../../public/p2.png'
import p3 from '../../../public/p3.png'
import { useLang } from '@/components/context/LangContext';

export default function ProductIntroductionPage() {
  const { lang } = useLang();

  // 雙語文案配置
  const content = {
    zh: {
      imgAlt1: "產品樣式1",
      imgAlt2: "產品樣式2",
      imgAlt3: "產品樣式3",
      pageTitle: "產品介紹",
      companyName: "BEAUTY LABEL PRINTING COMPANY 標緻商標印刷有限公司",
      subtitle: "標籤製造 —— 覆蓋服飾 / 鞋類全場景的標籤解決方案",
      // 服飾類標籤
      title1: "一、服飾類標籤",
      desc1: "針對服裝的穿著場景、洗護需求，提供多工藝標籤選擇：",
      item1_1: "• 品牌識別標",
      item1_2: "• 材質：高密織物、燙金織唛",
      item1_3: "• 特點：還原品牌 Logo 細節，觸感質感強，適用於外套領口、內衣側縫等位置；支持定製立體繡花、漸變色印刷工藝。",
      item1_4: "• 尺碼 / 規格標",
      item1_5: "• 材質：耐磨織物、防水印唛",
      item1_6: "• 特點：清晰標註 UK/US/EU 等多區域尺碼體系，耐反覆摩擦與水洗，常用於褲裝腰頭、T 恤後領。",
      item1_7: "• 成分 / 洗水標",
      item1_8: "• 材質：環保無紡布、柔軟織帶",
      item1_9: "• 特點：承載纖維成分、洗護說明（多語言版本），觸感柔軟不刺膚，符合紡織品安全標準；支持防褪色油墨印刷。",
      // 鞋類標籤
      title2: "二、鞋類標籤",
      desc2: "匹配鞋類縫製、耐磨需求，專注標籤的實用性與耐用性：",
      item2_1: "• 產地 / 規格標",
      item2_2: "• 材質：防水紙卡、耐磨織唛",
      item2_3: "• 特點：標註產地、貨號、鞋碼，粘貼 / 縫製於鞋舌內側，耐折疊與汗水浸漬。",
      item2_4: "• 追溯標籤",
      item2_5: "• 材質：防撕紙卡、QR 碼織唛",
      item2_6: "• 特點：整合二維碼 / 防偽碼，支持品牌追溯產品流通環節；適用於運動鞋、高端鞋履的品控管理。",
      // 定製類標籤
      title3: "三、定製類標籤",
      desc3: "針對特殊需求提供個性化解決方案：",
      item3_1: "• 功能型標籤",
      item3_2: "• 例如：防蟲標（添加天然驅蟲成分）、溫感標（遇熱變色提示洗護溫度），適用於特殊面料服飾 / 鞋類。",
      item3_3: "• 聯名款標籤",
      item3_4: "• 支持異材質拼接（如織物 + 金屬牌）、限量編號印刷，匹配品牌聯名款的專屬識別需求。",
      // 按鈕文案
      registerBtn: "立即註冊成為會員！即享會員優惠！"
    },
    en: {
      imgAlt1: "Product Style 1",
      imgAlt2: "Product Style 2",
      imgAlt3: "Product Style 3",
      pageTitle: "Products",
      companyName: "BEAUTY LABEL PRINTING COMPANY",
      subtitle: "Label manufacturing — All-round label solutions for apparel & footwear",
      // 服飾類標籤
      title1: "1. Apparel Labels",
      desc1: "We provide various craft labels to fit wearing and washing requirements of garments:",
      item1_1: "• Brand Label",
      item1_2: "• Material: High-density woven fabric, gold stamping woven label",
      item1_3: "• Feature: Perfectly restore brand logo details with premium texture. Suitable for collar, side seam of underwear. Custom embroidery and gradient printing are available.",
      item1_4: "• Size Label",
      item1_5: "• Material: Wear-resistant fabric, waterproof printed label",
      item1_6: "• Feature: Mark UK/US/EU standard sizes clearly. Resistant to repeated friction and washing. Widely used on waistband and back collar.",
      item1_7: "• Content & Care Label",
      item1_8: "• Material: Eco-friendly non-woven fabric, soft ribbon",
      item1_9: "• Feature: Show fiber composition and multi-language care instructions. Soft and skin-friendly, compliant with textile safety standards. Fade-resistant ink adopted.",
      // 鞋類標籤
      title2: "2. Footwear Labels",
      desc2: "Durable labels tailored for shoe stitching and daily use:",
      item2_1: "• Origin & Specification Label",
      item2_2: "• Material: Waterproof paper card, durable woven label",
      item2_3: "• Feature: Mark origin, item number and shoe size. Pasted or sewn on shoe tongue, resistant to folding and sweat.",
      item2_4: "• Traceability Label",
      item2_5: "• Material: Tear-proof paper card, QR code woven label",
      item2_6: "• Feature: Equipped with QR code & anti-counterfeit code for product tracking. Ideal for sports shoes and high-end footwear quality control.",
      // 定製類標籤
      title3: "3. Custom Labels",
      desc3: "Personalized solutions for special demands:",
      item3_1: "• Functional Label",
      item3_2: "• Examples: Insect-proof label with natural repellent, temperature-sensitive color-changing label. Fit for special fabric apparel and shoes.",
      item3_3: "• Co-branded Label",
      item3_4: "• Mixed materials (fabric + metal tag) and limited number printing available, to meet exclusive identification needs for co-branded products.",
      // 按鈕文案
      registerBtn: "Register now to become a member! Get more discount!"
    }
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* 導航欄 */}
      <Nav/>

      {/* 產品圖片區 */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-4">
          {/* 左側圖片組 */}
          <div className="space-y-2">
              <Image 
                src={p1}
                alt={t.imgAlt1} 
                className="w-full h-auto object-cover"
              />
          </div>
          <div className="space-y-2">
              <Image 
                src={p2}
                alt={t.imgAlt2} 
                className="w-full h-auto object-cover"
              />
          </div>
          <div className="space-y-2">
              <Image 
                src={p3}
                alt={t.imgAlt3} 
                className="w-full h-auto object-cover"
              />
          </div>
        </div>
      </section>

      {/* 產品介紹內容區 */}
      <main className="max-w-5xl mx-auto px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.pageTitle}</h1>
        <h2 className="text-lg text-gray-700 mb-2">{t.companyName}</h2>
        <p className="text-gray-700 mb-6">{t.subtitle}</p>

        {/* 一、服飾類標籤 */}
        <section className="mb-8">
          <h3 className="text-base font-semibold text-gray-800 mb-2">{t.title1}</h3>
          <p className="text-gray-700 text-sm mb-2">
            {t.desc1}
          </p>
          <div className="ml-4 space-y-1 text-sm text-gray-700">
            <p className="font-medium">{t.item1_1}</p>
            <p className="font-medium">{t.item1_2}</p>
            <p className="font-medium">{t.item1_3}</p>
            <p className="font-medium">{t.item1_4}</p>
            <p className="font-medium">{t.item1_5}</p>
            <p className="font-medium">{t.item1_6}</p>
            <p className="font-medium">{t.item1_7}</p>
            <p className="font-medium">{t.item1_8}</p>
            <p className="font-medium">{t.item1_9}</p>
          </div>
        </section>

        {/* 二、鞋類標籤 */}
        <section className="mb-8">
          <h3 className="text-base font-semibold text-gray-800 mb-2">{t.title2}</h3>
          <p className="text-gray-700 text-sm mb-2">
            {t.desc2}
          </p>
          <div className="ml-4 space-y-1 text-sm text-gray-700">
            <p className="font-medium">{t.item2_1}</p>
            <p className="font-medium">{t.item2_2}</p>
            <p className="font-medium">{t.item2_3}</p>
            <p className="font-medium">{t.item2_4}</p>
            <p className="font-medium">{t.item2_5}</p>
            <p className="font-medium">{t.item2_6}</p>
          </div>
        </section>

        {/* 三、定製類標籤 */}
        <section className="mb-12">
          <h3 className="text-base font-semibold text-gray-800 mb-2">{t.title3}</h3>
          <p className="text-gray-700 text-sm mb-2">
            {t.desc3}
          </p>
          <div className="ml-4 space-y-1 text-sm text-gray-700">
            <p className="font-medium">{t.item3_1}</p>
            <p className="font-medium">{t.item3_2}</p>
            <p className="font-medium">{t.item3_3}</p>
            <p className="font-medium">{t.item3_4}</p>
          </div>
        </section>

        {/* 註冊引導按鈕 */}
        <div className="text-center pt-8 border-t border-gray-200">
          <Link
            href="/register"
            className="inline-block px-8 py-2.5 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 transition-colors duration-200 
                       font-medium shadow-md hover:shadow-lg"
          >
            {t.registerBtn}
          </Link>
        </div>
      </main>
    </div>
  );
}