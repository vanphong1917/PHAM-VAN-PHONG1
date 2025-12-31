
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations } from './i18n';

type Locale = 'vi' | 'en';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('vi'); // Default to Vietnamese as requested

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[locale];
    
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        // Fallback to literal key if not found
        return translations['vi'][k] || translations['en'][k] || key;
      }
    }
    return result as string;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
