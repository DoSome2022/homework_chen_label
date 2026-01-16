'use client';
import Nav from '../../components/nav'
import { MapPin, Mail, Phone } from 'lucide-react';



export default function ContactUsPage() {
  return (
    <>
      <Nav />
      <div className="min-h-screen bg-white text-gray-800">
        <main className="max-w-4xl mx-auto px-6 py-12">
          {/* 頁面核心區：地圖 + 聯繫資訊 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Google Map 嵌入區 */}
            <div className="rounded-lg overflow-hidden shadow-sm w-full h-75 md:h-100">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d922.6828855360127!2d114.16339387766699!3d22.325990496759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x340400b69766fe57%3A0x5a1d67c1004af022!2sGodfrey%20Centre%2C%20Lai%20Chi%20Kok%20Rd%2C%20Tai%20Kok%20Tsui!5e0!3m2!1sen!2shk!4v1768360998526!5m2!1sen!2shk" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Godfrey Centre Location Map" // 添加可訪問性標題
              ></iframe>
            </div>

            {/* 聯絡資訊區 */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">聯絡我們</h1>
                <h2 className="text-xl text-gray-700 mt-2">BEAUTY LABEL PRINTING COMPANY</h2>
                <h3 className="text-lg text-gray-600 mt-1">標緻商標印刷有限公司</h3>
              </div>

              {/* 聯繫資訊列表（搭配Lucide圖標） */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-600 mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">地址</p>
                    <p className="text-sm text-gray-700">
                      Flat/Rm 130, 1/F, Godfrey Centre, 175-185<br />
                      Lai Chi Kok Road, Sham Shui Po, Kln
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-600 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <p className="text-sm text-gray-700">BIAOZHI1127@GMAIL.COM</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-600 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">電話</p>
                    <p className="text-sm text-gray-700">9556 5480</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}