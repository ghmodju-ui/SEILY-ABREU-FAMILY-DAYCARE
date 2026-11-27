"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { SIZES, UNIFORMS, formatUSD, type Size, type Uniform } from "@/lib/catalog";
import QuantityStepper from "./QuantityStepper";

// Typographic product cards only — no photos or illustrations by design.
function UniformCard({ item, index }: { item: Uniform; index: number }) {
  const { t, lang } = useLanguage();
  const { addUniform } = useCart();
  const [size, setSize] = useState<Size>("2T");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const isSport = item.id.includes("sport");

  const handleAdd = () => {
    addUniform(item.id, size, qty);
    setAdded(true);
    setQty(1);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="flex flex-col rounded-3xl border border-ink/10 bg-white p-6 shadow-sm transition hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${
            isSport ? "bg-teal-50 text-teal-700" : "bg-coral-50 text-coral-700"
          }`}
        >
          {item.category[lang]}
        </span>
        <span className="font-display text-sm font-semibold text-ink/30">0{index + 1}</span>
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold leading-snug text-ink">{item.name[lang]}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{item.description[lang]}</p>
      <p className="mt-4 font-display text-3xl font-semibold text-ink">
        {formatUSD(item.price)} <span className="text-sm font-semibold text-ink/40">USD</span>
      </p>

      <fieldset className="mt-5">
        <legend className="text-xs font-bold uppercase tracking-wide text-ink/50">{t.store.size}</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SIZES.map((s) => {
            const active = s === size;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={active}
                className={`min-w-[2.6rem] rounded-xl border px-2.5 py-1.5 text-sm font-bold transition ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-ink/15 bg-white text-ink/80 hover:border-ink/40"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wide text-ink/50">{t.store.quantity}</span>
          <div className="mt-2">
            <QuantityStepper
              value={qty}
              onChange={setQty}
              decreaseLabel={t.store.decrease}
              increaseLabel={t.store.increase}
            />
          </div>
        </div>
        <p className="text-right text-sm font-semibold text-ink/60">
          {formatUSD(item.price * qty)}
        </p>
      </div>

      <button type="button" onClick={handleAdd} className="btn-primary mt-5 w-full">
        {added ? t.store.added : t.store.addToCart}
      </button>
    </article>
  );
}

export default function UniformStore() {
  const { t } = useLanguage();
  return (
    <section id="uniformes" className="scroll-mt-32 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.store.eyebrow}</p>
          <h2 className="section-title">{t.store.title}</h2>
          <p className="mt-3 text-ink/70">{t.store.subtitle}</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {UNIFORMS.map((u, i) => (
            <UniformCard key={u.id} item={u} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
