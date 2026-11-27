"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ChatIcon, ClockIcon, ShieldIcon } from "./Icons";

export default function Contact() {
  const { t } = useLanguage();
  const items = [
    { icon: ClockIcon, label: t.contact.hours, value: t.contact.hoursValue },
    { icon: ShieldIcon, label: t.contact.accreditation, value: t.contact.accreditationValue },
    { icon: ChatIcon, label: t.contact.languages, value: t.contact.languagesValue },
  ];

  return (
    <section id="contacto" className="scroll-mt-32 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] bg-ink text-white">
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-sun-400">{t.contact.eyebrow}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{t.contact.title}</h2>
              <p className="mt-3 text-white/70">Seily Abreu Family Day Care LLC</p>
              <Link href="/#inscripcion" className="btn-primary mt-8">
                {t.hero.ctaEnroll}
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {items.map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex gap-4 rounded-2xl bg-white/5 p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-sun-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-white/50">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
