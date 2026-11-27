"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { Lang } from "@/lib/catalog";
import { GlobeIcon } from "./Icons";

export default function LanguageToggle({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { lang, setLang, t } = useLanguage();
  const options: { value: Lang; label: string }[] = [
    { value: "es", label: "ES" },
    { value: "en", label: "EN" },
  ];
  const isDark = variant === "dark";

  return (
    <div
      role="group"
      aria-label={t.nav.langLabel}
      className={`inline-flex items-center gap-1 rounded-full p-0.5 text-xs font-bold ${
        isDark ? "bg-white/10" : "bg-ink/5"
      }`}
    >
      <GlobeIcon className={`ml-1.5 h-3.5 w-3.5 ${isDark ? "text-white/70" : "text-ink/50"}`} />
      {options.map((o) => {
        const active = lang === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => setLang(o.value)}
            aria-pressed={active}
            className={`rounded-full px-2.5 py-1 transition ${
              active
                ? isDark
                  ? "bg-white text-ink"
                  : "bg-ink text-white"
                : isDark
                  ? "text-white/80 hover:text-white"
                  : "text-ink/60 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
