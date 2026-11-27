"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ChatIcon, ClockIcon, HomeIcon, MoonIcon, ShieldIcon, StarIcon } from "./Icons";

export default function Hero() {
  const { t } = useLanguage();
  const whyIcons = [ChatIcon, ShieldIcon, HomeIcon, MoonIcon];

  return (
    <>
      <section id="inicio" className="relative scroll-mt-32 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sun-100 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-teal-50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:pb-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sun-400/50 bg-sun-100 px-3.5 py-1.5 text-xs font-bold text-ink">
              <StarIcon className="h-3.5 w-3.5 text-sun-500" />
              {t.hero.badge}
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
              {t.hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">{t.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/#inscripcion" className="btn-primary">
                {t.hero.ctaEnroll}
              </Link>
              <Link href="/#planes" className="btn-secondary">
                {t.hero.ctaPlans}
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {t.hero.stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-ink/5 bg-white/70 p-3 sm:p-4">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="whitespace-nowrap font-display text-lg font-semibold text-coral-600 sm:text-2xl">{s.value}</dd>
                  <dd className="mt-0.5 text-xs font-semibold text-ink/60">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 -rotate-3 rounded-[2rem] bg-coral-400" aria-hidden />
            <div className="relative rounded-[2rem] bg-white p-8 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-600">
                  <ClockIcon className="h-6 w-6" />
                </span>
                <p className="font-display text-xl font-semibold leading-snug text-ink">{t.hero.cardTitle}</p>
              </div>
              <div className="mt-6 rounded-2xl bg-cream p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-ink/50">{t.hero.cardDays}</p>
                <p className="mt-1 font-display text-3xl font-semibold text-ink">{t.hero.cardHours}</p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-sun-500" aria-label="STAR 4">
                {[0, 1, 2, 3].map((i) => (
                  <StarIcon key={i} className="h-7 w-7" />
                ))}
                <span className="ml-2 text-sm font-bold text-ink">Keystone STAR 4</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="chip">Español</span>
                <span className="chip">English</span>
                <span className="chip">1–13</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="eyebrow">{t.why.eyebrow}</p>
            <h2 className="section-title">{t.why.title}</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.why.items.map((item, idx) => {
              const Icon = whyIcons[idx];
              return (
                <div key={item.title} className="rounded-3xl border border-ink/5 bg-cream p-6 transition hover:-translate-y-1 hover:shadow-soft">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-coral-500 shadow-sm">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
