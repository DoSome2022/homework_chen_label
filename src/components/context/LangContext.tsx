'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'zh' | 'en';

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('zh');

  const toggleLang = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

// 自訂 Hook 方便取用
export function useLang() {
  const context = useContext(LangContext);
  if (!context) throw new Error('useLang 必須在 LangProvider 內使用');
  return context;
}