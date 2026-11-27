"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Logo from "./Logo";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const links = [
    { href: "/#inicio", label: t.nav.home },
    { href: "/#planes", label: t.nav.plans },
    { href: "/#uniformes", label: t.nav.store },
    { href: "/#inscripcion", label: t.nav.enroll },
    { href: "/#contacto", label: t.nav.contact },
  ];

  return (
    <footer className="border-t border-ink/10 bg-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/70">{t.footer.tagline}</p>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-ink">{t.footer.links}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ink/70 hover:text-coral-600">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-ink">{t.footer.visit}</p>
          <ul className="mt-4 space-y-2 text-sm text-ink/70">
            <li>{t.contact.hoursValue}</li>
            <li>{t.contact.accreditationValue}</li>
            <li>{t.contact.languagesValue}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-ink/60 sm:px-6">
          © {year} Seily Abreu Family Day Care LLC. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
