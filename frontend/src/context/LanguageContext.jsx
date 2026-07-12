import React, { createContext, useContext, useState, useCallback } from "react";
import { t as translate } from "../utils/translations";

const LanguageContext = createContext(null);

export const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳" },
];

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("f2f-lang") || "en";
  });

  const switchLang = useCallback((code) => {
    setLang(code);
    localStorage.setItem("f2f-lang", code);
  }, []);

  const toggleLang = useCallback(() => {
    const next = lang === "en" ? "mr" : "en";
    switchLang(next);
  }, [lang, switchLang]);

  // Shorthand translator bound to current language
  const t = useCallback(
    (section, key) => translate(section, key, lang),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang: switchLang, toggleLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLang must be used within a LanguageProvider");
  return context;
}
