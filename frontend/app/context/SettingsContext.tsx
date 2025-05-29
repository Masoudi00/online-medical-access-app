'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Settings = {
  language: 'en' | 'fr';
  theme: 'light' | 'dark';
  setLanguage: (lang: 'en' | 'fr') => void;
  setTheme: (theme: 'light' | 'dark') => void;
};

const SettingsContext = createContext<Settings | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <SettingsContext.Provider value={{ language, theme, setLanguage, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
