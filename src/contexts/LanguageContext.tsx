'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import vi from '@/locales/vi.json';
import en from '@/locales/en.json';

type Locale = 'vi' | 'en';

const translations = { vi, en };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get nested values from an object using a dot-notation string
const getNestedTranslation = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem('locale') as Locale;
      if (savedLocale && (savedLocale === 'vi' || savedLocale === 'en')) {
        setLocaleState(savedLocale);
      }
    } catch (error) {
        console.error("Could not access localStorage:", error);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
        localStorage.setItem('locale', newLocale);
    } catch (error) {
        console.error("Could not access localStorage:", error);
    }
  };

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    let translation = getNestedTranslation(translations[locale], key);
    
    if (translation && options) {
      Object.keys(options).forEach(optKey => {
        translation = translation!.replace(new RegExp(`{{${optKey}}}`, 'g'), String(options[optKey]));
      });
    }

    return translation || key;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
