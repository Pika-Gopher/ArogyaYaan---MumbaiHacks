"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "@/src/i18n/en.json";
import mr from "@/src/i18n/mr.json";

const translations = { en, mr };
const STORAGE_KEY = "app_lang";

const I18nContext = createContext();

function interpolate(str, params = {}) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    return params[k] ?? "";
  });
}

export function I18nProvider({ children }) {
  const [lang, setLangRaw] = useState("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) setLangRaw(saved);
  }, []);

  const setLang = (l) => {
    if (!translations[l]) return;
    setLangRaw(l);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l === "mr" ? "mr" : "en";
    }
  };

  const t = (key, params) => {
    const seg = key.split(".");
    let value = translations[lang];
    for (const s of seg) {
      if (!value) break;
      value = value[s];
    }
    if (!value) return key;
    if (params) return interpolate(value, params);
    return value;
  };

  const formatNumber = (n) => new Intl.NumberFormat(lang === "mr" ? "mr-IN" : "en-IN").format(n);
  const formatCurrency = (amount) =>
    new Intl.NumberFormat(lang === "mr" ? "mr-IN" : "en-IN", { style: "currency", currency: "INR" }).format(amount);

  const value = useMemo(() => ({ lang, setLang, t, formatNumber, formatCurrency }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
