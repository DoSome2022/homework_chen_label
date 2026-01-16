'use client';
import Image from 'next/image';
import Nav from '../../components/nav'


export default function ProductIntroductionPage() {
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
                src="/p1.png"
                alt="產品樣式1" 
                              width={600}  // 原始圖片寬度
  height={600} // 原始圖片高度
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
                className="w-full h-auto object-cover"
              />
          </div>
          <div className="space-y-2">
              <Image 
                src="/p2.png"
                alt="產品樣式1" 
                              width={600}  // 原始圖片寬度
  height={600} // 原始圖片高度
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
                className="w-full h-auto object-cover"
              />
          </div>
          <div className="space-y-2">
              <Image 
                src="/p3.png"
                alt="產品樣式1" 
                              width={600}  // 原始圖片寬度
  height={600} // 原始圖片高度
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // 響應式尺寸
                className="w-full h-auto object-cover"
              />
          </div>
          
          
        </div>
      </section>

      {/* 產品介紹內容區 */}
      <main className="max-w-5xl mx-auto px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">產品介紹</h1>
        <h2 className="text-lg text-gray-700 mb-2">BEAUTY LABEL PRINTING COMPANY 標緻商標印刷有限公司 </h2>
        <p className="text-gray-700 mb-6">標籤製造 —— 覆蓋服飾 / 鞋類全場景的標籤解決方案</p>

        {/* 一、膠囊服飾標籤 */}
        <section className="mb-8">
          <h3 className="text-base font-semibold text-gray-800 mb-2">一、服飾類標籤</h3>
          <p className="text-gray-700 text-sm mb-2">
            針對服裝的穿著場景、洗護需求，提供多工藝標籤選擇：
          </p>
          <div className="ml-4 space-y-1 text-sm text-gray-700">
            <p className="font-medium">• 品牌識別標</p>
            <p className="font-medium">• 材質：高密織物、燙金織唛</p>
            <p className="font-medium">• 特點：還原品牌 Logo 細節，觸感質感強，適用於外套領口、內衣側縫等位置；支持定製立體繡花、漸變色印刷工藝。</p>
            <p className="font-medium">• 尺碼 / 規格標</p>
            <p className="font-medium">• 材質：耐磨織物、防水印唛</p>
            <p className="font-medium">• 特點：清晰標註 UK/US/EU 等多區域尺碼體系，耐反覆摩擦與水洗，常用於褲裝腰頭、T 恤後領。</p>
            <p className="font-medium">• 成分 / 洗水標</p>
            <p className="font-medium">• 材質：環保無紡布、柔軟織帶</p>
            <p className="font-medium">• 特點：承載纖維成分、洗護說明（多語言版本），觸感柔軟不刺膚，符合紡織品安全標準；支持防褪色油墨印刷。</p>
          </div>
        </section>

        {/* 二、鞋類標籤 */}
        <section className="mb-8">
          <h3 className="text-base font-semibold text-gray-800 mb-2">二、鞋類標籤</h3>
          <p className="text-gray-700 text-sm mb-2">
            匹配鞋類縫製、耐磨需求，專注標籤的實用性與耐用性：
          </p>
          <div className="ml-4 space-y-1 text-sm text-gray-700">
            <p className="font-medium">• 產地 / 規格標</p>
            <p className="font-medium">• 材質：防水紙卡、耐磨織唛</p>
            <p className="font-medium">• 特點：標註產地、貨號、鞋碼，粘貼 / 縫製於鞋舌內側，耐折疊與汗水浸漬。</p>
            <p className="font-medium">• 追溯標籤</p>
            <p className="font-medium">• 材質：防撕紙卡、QR 碼織唛</p>
            <p className="font-medium">• 特點：整合二維碼 / 防偽碼，支持品牌追溯產品流通環節；適用於運動鞋、高端鞋履的品控管理。</p>
            
          </div>
        </section>

        {/* 三、定製類標籤 */}
        <section>
          <h3 className="text-base font-semibold text-gray-800 mb-2">三、定製類標籤</h3>
          <p className="text-gray-700 text-sm mb-2">
            針對特殊需求提供個性化解決方案：
          </p>
          <div className="ml-4 space-y-1 text-sm text-gray-700">
            <p className="font-medium">• 功能型標籤</p>
            <p className="font-medium">• 例如：防蟲標（添加天然驅蟲成分）、溫感標（遇熱變色提示洗護溫度），適用於特殊面料服飾 / 鞋類。</p>
            <p className="font-medium">• 聯名款標籤</p>
            <p className="font-medium">• 支持異材質拼接（如織物 + 金屬牌）、限量編號印刷，匹配品牌聯名款的專屬識別需求。</p>
          </div>
        </section>
      </main>
    </div>
  );
}