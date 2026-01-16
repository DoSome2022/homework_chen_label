// components/nav.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react'; // ← 新增這行
import { LogIn, UserPlus, MessageSquareQuote, Menu, X, LogOut } from 'lucide-react';

export default function Nav() {
  const { data: session, status } = useSession(); // 取得登入狀態
  const isAuthenticated = status === 'authenticated';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' }); // 登出後導回首頁
  };

  return (
    <nav className="border-b border-gray-50 bg-white sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-3">
        {/* 桌面端導航欄 */}
        <div className="flex justify-between items-center">
          {/* 手機端漢堡按鈕 */}
          <button
            className="md:hidden flex items-center"
            onClick={toggleMobileMenu}
            aria-label="切換導航選單"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-gray-700" />
            ) : (
              <Menu size={24} className="text-gray-700" />
            )}
          </button>

          {/* 左側導航連結（桌面版顯示） */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors">首頁</Link>
            <Link href="/productsintroduction" className="text-gray-700 hover:text-gray-900 transition-colors">產品介紹</Link>
            <Link href="/aboutus" className="text-gray-700 hover:text-gray-900 transition-colors">關於我們</Link>
            <Link href="/contactus" className="text-gray-700 hover:text-gray-900 transition-colors">聯絡我們</Link>
          </div>

          {/* 右側功能區域 */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* 已登入：顯示使用者名稱（可選）與登出按鈕 */}
                <span className="text-sm text-gray-700 hidden md:inline">
                  {session?.user?.name || session?.user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-700 hover:text-red-600 text-sm transition-colors"
                >
                  <LogOut size={14} />
                  登出
                </button>
              </>
            ) : (
              <>
                {/* 未登入：顯示登入與註冊 */}
                <Link href="/login" className="flex items-center gap-1 text-gray-700 hover:text-gray-900 text-sm">
                  <LogIn size={14} /> 登入
                </Link>
                <Link href="/register" className="flex items-center gap-1 text-gray-700 hover:text-gray-900 text-sm">
                  <UserPlus size={14} /> 註冊
                </Link>
              </>
            )}

            {/* 我要報價按鈕（無論登入與否皆顯示） */}
            <Link
              href="/register"
              className="bg-[#C2D0E2] text-gray-700 font-bold px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-yellow-300 transition-colors"
            >
              <MessageSquareQuote size={14} /> 我要報價！
            </Link>
          </div>
        </div>

        {/* 手機端下拉選單 */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-3 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900 py-2 px-1 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                首頁
              </Link>
              <Link
                href="/productsintroduction"
                className="text-gray-700 hover:text-gray-900 py-2 px-1 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                產品介紹
              </Link>
              <Link
                href="/aboutus"
                className="text-gray-700 hover:text-gray-900 py-2 px-1 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                關於我們
              </Link>
              <Link
                href="/contactus"
                className="text-gray-700 hover:text-gray-900 py-2 px-1 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                聯絡我們
              </Link>

              {/* 手機版登入/登出區域 */}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-gray-700 hover:text-red-600 py-2 px-1 transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} /> 登出
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 py-2 px-1 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    登入
                  </Link>
                  <Link
                    href="/register"
                    className="text-gray-700 hover:text-gray-900 py-2 px-1 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    註冊
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}