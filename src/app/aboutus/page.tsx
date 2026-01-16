'use client';
import Image from 'next/image';
import Nav from '../../components/nav'

export default function AboutUsPage() {
  return (
    <>
      <Nav />
      <div className="min-h-screen bg-white text-gray-800">
        <main className="max-w-4xl mx-auto px-6 py-12">
          {/* 標籤樣式展示區 */}
          <div className="flex justify-center mb-10">
            <div className="w-48 h-auto">
              <Image 
                src="/about.png"
                alt="標籤樣式" 
                              width={600}  // 原始圖片寬度
  height={600} // 原始圖片高度
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* 頁面標題區 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">關於我們</h1>
            <h2 className="text-xl text-gray-700 mt-2">BEAUTY LABEL PRINTING COMPANY</h2>
            <h3 className="text-lg text-gray-600 mt-1">標緻商標印刷有限公司 </h3>
            <p className="text-gray-700 mt-4">
              BEAUTY LABEL PRINTING COMPANY 標籤製造 —— 服飾鞋類標籤領域的專注者與品質守護者
            </p>
          </div>

          {/* 公司介紹內容區 */}
          <section className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <p>
              在服飾、鞋類產業的細節鏈條中，一枚小小的標籤從來不是 “配角”：它承載著品牌識別、產品規格、品質認證的核心信息，更是連接品牌與消費者的 “隱形門面”。BEAUTY LABEL PRINTING COMPANY  標籤製造，正是深耕這一細分領域的專業標籤供應商 —— 自創立以來，我們始終專注於服飾、鞋類標籤的研發、生產與定製服務，以 “細節見品質，專注鑄口碑” 為理念，成為眾多服飾鞋類品牌背後可靠的標籤合作夥伴。
            </p>

            <p>
              不同於通用型包裝廠商，我們的核心優勢在於 “垂直深耕”：從服飾的品牌標、尺碼標、洗水標，到鞋類的產地標、規格標、追溯標籤，我們熟稔行業對標籤的特殊要求 —— 比如服飾標籤需耐洗水、無異味，鞋類標籤需適配縫紉工藝、印刷清晰耐磨。多年來，我們服務過休閒服飾、運動鞋履、高端時裝等多類客戶，積累了針對不同產品場景的標籤解決方案：無論是需要體現品牌質感的織唛標，還是承載多語言成分說明的印唛標，或是需整合追溯二維碼的智能標籤，我們都能基於客戶需求快速響應。
            </p>

            <p>
              品質是我們的立身之本，而標準化流程則是品質的底線。從客戶需求確認到標籤交付，我們建立了覆蓋 “出辦 - 加工 - 大貨 - 流水線生產 - 環保認證” 的全鏈路管理體系：前期 “出辦” 階段，我們會根據客戶的設計稿、材質偏好，在 3 個工作日內完成樣品打樣，確保顏色、工藝、規格與客戶預期一致；樣品確認後進入 “加工” 環節，我們對原材料進行預處理（如織物定型、油墨調試），杜絕批量生產中的偏差；而 “大貨” 環節則會啟動全量物料檢測，確保每一批原材料符合環保與品質標準；後續的 “流水線生產” 採用自動化設備與熟練工藝團隊配合，既保障日均數十萬枚標籤的產能，也能通過逐件抽檢避免印刷模糊、縫邊脫線等細節問題；更重要的是，我們全流程符合國家環保生產標準，從油墨選擇到廢料處理均通過環保資質認證，為客戶的綠色供應鏈體系提供可靠支撐。
            </p>

            <p>
              我們深知，標籤是品牌形象的延伸 —— 因此 “定製化” 與 “靈活性” 是我們服務的核心標籤。無論客戶是需要匹配品牌視覺的專屬配色，還是針對特殊面料調整標籤厚度，或是要求標籤承載多國語言的洗滌說明，我們的研發與工藝團隊都能快速對接；即使是小批量的定製訂單，我們也能通過柔性生產線保障交期與品質，避免客戶因訂單規模受限而妥協需求。
            </p>

            <p>
              從一枚標籤的針腳、油墨，到整個供應鏈的效率、環保，XX 標籤製造始終以 “做品牌背後的可靠夥伴” 為定位，在細分領域中堅守專注、打磨品質。如果您的品牌正在尋找匹配需求的標籤供應商，歡迎與我們對接 —— 我們願以專業的產品與服務，成為您品牌細節中的品質加分項。
            </p>
          </section>
        </main>
      </div>
    </>
  );
}