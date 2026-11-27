"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { PLANS, formatUSD, type PlanId } from "@/lib/catalog";
import { CheckIcon } from "./Icons";

const accents = [
  { ring: "border-teal-100", badge: "bg-teal-50 text-teal-700", check: "text-teal-500" },
  { ring: "border-sun-400/40", badge: "bg-sun-100 text-ink", check: "text-sun-500" },
  { ring: "border-coral-400", badge: "bg-coral-50 text-coral-700", check: "text-coral-500" },
  { ring: "border-ink/10", badge: "bg-ink text-white", check: "text-ink" },
];

export default function Plans() {
  const { t, lang } = useLanguage();
  const { addPlan } = useCart();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState<PlanId | null>(null);

  const handleAdd = (id: PlanId) => {
    addPlan(id);
    setJustAdded(id);
    window.setTimeout(() => setJustAdded((cur) => (cur === id ? null : cur)), 1600);
  };

  return (
    <section id="planes" className="scroll-mt-32 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t.plans.eyebrow}</p>
          <h2 className="section-title">{t.plans.title}</h2>
          <p className="mt-3 text-ink/70">{t.plans.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan, idx) => {
            const a = accents[idx];
            return (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-3xl border-2 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft ${a.ring} ${
                  plan.featured ? "xl:-mt-3 xl:pb-9" : ""
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-coral-500 px-3 py-1 text-xs font-bold text-white shadow">
                    {t.plans.popular}
                  </span>
                )}
                <span className={`self-start rounded-full px-3 py-1 text-xs font-bold ${a.badge}`}>
                  {plan.tagline[lang]}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{plan.name[lang]}</h3>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-semibold text-ink">{formatUSD(plan.price)}</span>
                  <span className="text-sm font-semibold text-ink/50">{t.plans.oneTime}</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features[lang].map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-ink/80">
                      <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${a.check}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 grid gap-2">
                  <button type="button" onClick={() => handleAdd(plan.id)} className="btn-primary w-full">
                    {justAdded === plan.id ? t.plans.added : t.plans.addToCart}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/checkout?plan=${plan.id}`)}
                    className="btn-secondary w-full"
                  >
                    {t.plans.payNow}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
