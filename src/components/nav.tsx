// components/nav.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogIn, UserPlus, MessageSquareQuote, Menu, X, LogOut } from 'lucide-react';
import { useLang } from './context/LangContext';


export default function Nav() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, toggleLang } = useLang();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // ═══ 雙語文字對照表 ═══
  const navText = {
    zh: {
      home: '首頁',
      product: '產品介紹',
      about: '關於我們',
      contact: '聯絡我們',
      login: '登入',
      register: '註冊',
      quote: '我要報價！',
      logout: '登出',
      langSwitch: 'EN',
    },
    en: {
      home: 'Home',
      product: 'Products',
      about: 'About Us',
      contact: 'Contact',
      login: 'Login',
      register: 'Register',
      quote: 'Get Quote',
      logout: 'Logout',
      langSwitch: '中文',
    },
  };
  const t = navText[lang];

  return (
    <nav className="border-b border-gray-50 bg-white sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* ─── 手機漢堡按鈕 ─── */}
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

          {/* ─── 桌面端左側導航 ─── */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors">
              {t.home}
            </Link>
            <Link href="/productsintroduction" className="text-gray-700 hover:text-gray-900 transition-colors">
              {t.product}
            </Link>
            <Link href="/aboutus" className="text-gray-700 hover:text-gray-900 transition-colors">
              {t.about}
            </Link>
            <Link href="/contactus" className="text-gray-700 hover:text-gray-900 transition-colors">
              {t.contact}
            </Link>
          </div>

          {/* ─── 右側功能區 ─── */}
          <div className="flex items-center gap-4">
            {/* 語言切換按鈕（桌面） */}
            <button
              onClick={toggleLang}
              className="border border-gray-300 px-2 py-1 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {t.langSwitch}
            </button>

            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700 hidden md:inline">
                  {session?.user?.name || session?.user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-700 hover:text-red-600 text-sm transition-colors"
                >
                  <LogOut size={14} /> {t.logout}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-1 text-gray-700 hover:text-gray-900 text-sm">
                  <LogIn size={14} /> {t.login}
                </Link>
                <Link href="/register" className="flex items-center gap-1 text-gray-700 hover:text-gray-900 text-sm">
                  <UserPlus size={14} /> {t.register}
                </Link>
              </>
            )}

            {/* 我要報價（始終顯示） */}
            <Link
              href="/register"
              className="bg-[#C2D0E2] text-gray-700 font-bold px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-yellow-300 transition-colors"
            >
              <MessageSquareQuote size={14} /> {t.quote}
            </Link>
          </div>
        </div>

        {/* ─── 手機端下拉選單 ─── */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-3 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900 py-2 px-1 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.home}
              </Link>
              <Link
                href="/productsintroduction"
                className="text-gray-700 hover:text-gray-900 py-2 px-1 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.product}
              </Link>
              <Link
                href="/aboutus"
                className="text-gray-700 hover:text-gray-900 py-2 px-1 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.about}
              </Link>
              <Link
                href="/contactus"
                className="text-gray-700 hover:text-gray-900 py-2 px-1 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.contact}
              </Link>

              {/* 手機版語言切換 */}
              <button
                onClick={() => {
                  toggleLang();
                  setIsMobileMenuOpen(false);
                }}
                className="w-fit border border-gray-300 px-2 py-1 rounded text-sm text-gray-700 mt-2"
              >
                {lang === 'zh' ? '切換 English' : 'Switch 中文'}
              </button>

              {/* 手機版登入/登出 */}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-gray-700 hover:text-red-600 py-2 px-1 transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} /> {t.logout}
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 py-2 px-1 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t.login}
                  </Link>
                  <Link
                    href="/register"
                    className="text-gray-700 hover:text-gray-900 py-2 px-1 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t.register}
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
