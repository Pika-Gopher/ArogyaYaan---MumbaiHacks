"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/src/context/I18nContext";

type LanguageToggleProps = {
  collapsed?: boolean;
};

export default function LanguageToggle({ collapsed = false }: LanguageToggleProps) {
  const { lang, setLang } = useI18n();

  const toggle = () => {
    setLang(lang === "en" ? "mr" : "en");
  };

  return (
    <button
      className={`px-3 py-2 rounded text-sm font-medium ${
        collapsed ? "w-full text-center" : ""
      }`}
      onClick={toggle}
    >
      <Globe size={16} />
    </button>
  );
}