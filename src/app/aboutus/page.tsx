'use client';
import Image from 'next/image';
import Nav from '../../components/nav'

import aboutPic from '../../../public/about.png'
import { useLang } from '@/components/context/LangContext';

export default function AboutUsPage() {
  const { lang } = useLang();

  // 雙語文案配置
  const content = {
    zh: {
      imgAlt: "標籤樣式",
      pageTitle: "關於我們",
      companyEn: "BEAUTY LABEL PRINTING COMPANY",
      companyZh: "標緻商標印刷有限公司",
      subtitle: "服飾鞋類標籤領域的專注者與品質守護者",
      p1: "在服飾、鞋類產業的細節鏈條中，一枚小小的標籤從來不是 “配角”：它承載著品牌識別、產品規格、品質認證的核心信息，更是連接品牌與消費者的 “隱形門面”。標緻商標印刷，正是深耕這一細分領域的專業標籤供應商 —— 自創立以來，我們始終專注於服飾、鞋類標籤的研發、生產與定製服務，以 “細節見品質，專注鑄口碑” 為理念，成為眾多服飾鞋類品牌背後可靠的標籤合作夥伴。",
      p2: "不同於通用型包裝廠商，我們的核心優勢在於 “垂直深耕”：從服飾的品牌標、尺碼標、洗水標，到鞋類的產地標、規格標、追溯標籤，我們熟稔行業對標籤的特殊要求 —— 比如服飾標籤需耐洗水、無異味，鞋類標籤需適配縫紉工藝、印刷清晰耐磨。多年來，我們服務過休閒服飾、運動鞋履、高端時裝等多類客戶，積累了針對不同產品場景的標籤解決方案：無論是需要體現品牌質感的織唛標，還是承載多語言成分說明的印唛標，或是需整合追溯二維碼的智能標籤，我們都能基於客戶需求快速響應。",
      p3: "品質是我們的立身之本，而標準化流程則是品質的底線。從客戶需求確認到標籤交付，我們建立了覆蓋 “出辦 - 加工 - 大貨 - 流水線生產 - 環保認證” 的全鏈路管理體系：前期 “出辦” 階段，我們會根據客戶的設計稿、材質偏好，在 3 個工作日內完成樣品打樣，確保顏色、工藝、規格與客戶預期一致；樣品確認後進入 “加工” 環節，我們對原材料進行預處理（如織物定型、油墨調試），杜絕批量生產中的偏差；而 “大貨” 環節則會啟動全量物料檢測，確保每一批原材料符合環保與品質標準；後續的 “流水線生產” 採用自動化設備與熟練工藝團隊配合，既保障日均數十萬枚標籤的產能，也能通過逐件抽檢避免印刷模糊、縫邊脫線等細節問題；更重要的是，我們全流程符合國家環保生產標準，從油墨選擇到廢料處理均通過環保資質認證，為客戶的綠色供應鏈體系提供可靠支撐。",
      p4: "我們深知，標籤是品牌形象的延伸 —— 因此 “定製化” 與 “靈活性” 是我們服務的核心。無論客戶是需要匹配品牌視覺的專屬配色，還是針對特殊面料調整標籤厚度，或是要求標籤承載多國語言的洗滌說明，我們的研發與工藝團隊都能快速對接；即使是小批量的定製訂單，我們也能通過柔性生產線保障交期與品質，避免客戶因訂單規模受限而妥協需求。",
      p5: "從一枚標籤的針腳、油墨，到整個供應鏈的效率、環保，標緻商標印刷始終以 “做品牌背後的可靠夥伴” 為定位，在細分領域中堅守專注、打磨品質。如果您的品牌正在尋找匹配需求的標籤供應商，歡迎與我們對接 —— 我們願以專業的產品與服務，成為您品牌細節中的品質加分項。"
    },
    en: {
      imgAlt: "Label Style",
      pageTitle: "About Us",
      companyEn: "BEAUTY LABEL PRINTING COMPANY",
      companyZh: "Beauty Label Printing Co., Ltd.",
      subtitle: "Professional & Reliable Manufacturer for Apparel & Footwear Labels",
      p1: "In the apparel and footwear industry, a small label is never just an accessory. It carries brand identity, product specifications and quality certification, acting as an invisible bridge between brands and customers. As a professional label supplier, we focus on R&D, production and custom service for apparel and footwear labels. Adhering to the philosophy of \"Quality lies in details, reputation comes from dedication\", we have become a trusted partner for numerous brands.",
      p2: "Unlike general packaging manufacturers, we focus deeply on label production. We produce brand labels, size labels and care labels for garments, as well as origin labels, specification labels and traceability labels for shoes. We fully understand industry requirements: clothing labels need to be wash-resistant and odor-free, while footwear labels require durable printing and good stitching performance. We serve casual wear, sports shoes and high-end fashion brands. We can provide woven labels, printed labels and QR code traceable labels according to your demands.",
      p3: "Quality is our foundation, supported by standardized working procedures. We have built a complete management system covering sampling, processing, mass production and environmental certification. We finish samples within 3 working days to confirm colors, craftsmanship and sizes. All raw materials are pre-treated and fully inspected before mass production. Our automated production line ensures large daily output, and random inspection prevents printing and stitching defects. The whole production process complies with environmental regulations to support your green supply chain.",
      p4: "We regard labels as part of brand image, so customization and flexibility are our core strengths. We offer exclusive colors, customized thickness and multi-language care instructions. Our flexible production line supports both large orders and small-batch customization, delivering qualified products on time.",
      p5: "From tiny stitches and ink to overall supply chain efficiency and environmental protection, we keep improving ourselves to be your trustworthy partner. If you are looking for a professional label supplier, feel free to contact us. We will add value to your brand with premium products and services."
    }
  };

  const t = content[lang];

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-white text-gray-800">
        <main className="max-w-4xl mx-auto px-6 py-12">
          {/* 圖片展示 */}
          <div className="flex justify-center mb-10">
            <div className="w-48 h-auto">
              <Image 
                src={aboutPic}
                alt={t.imgAlt} 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* 頁面標題 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t.pageTitle}</h1>
            <h2 className="text-xl text-gray-700 mt-2">{t.companyEn}</h2>
            <h3 className="text-lg text-gray-600 mt-1">{t.companyZh}</h3>
            <p className="text-gray-700 mt-4">
              {t.subtitle}
            </p>
          </div>

          {/* 公司介紹內容 */}
          <section className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <p>{t.p1}</p>
            <p>{t.p2}</p>
            <p>{t.p3}</p>
            <p>{t.p4}</p>
            <p>{t.p5}</p>
          </section>
        </main>
      </div>
    </>
  );
}