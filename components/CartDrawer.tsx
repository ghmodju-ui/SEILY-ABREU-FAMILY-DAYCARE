"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { unitPrice, useCart, type CartItem } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { findPlan, findUniform, formatUSD, type Lang } from "@/lib/catalog";
import { CloseIcon, TrashIcon } from "./Icons";
import QuantityStepper from "./QuantityStepper";

export function itemName(item: CartItem, lang: Lang) {
  return item.kind === "plan"
    ? findPlan(item.productId)?.name[lang] ?? ""
    : findUniform(item.productId)?.name[lang] ?? "";
}

export default function CartDrawer() {
  const { t, lang } = useLanguage();
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, count } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, closeCart]);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={closeCart}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.cart.title}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ${
          isOpen ? "visible translate-x-0" : "invisible translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            {t.cart.title} <span className="text-base text-ink/50">({count} {t.cart.items})</span>
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5"
            aria-label={t.cart.close}
            tabIndex={isOpen ? 0 : -1}
          >
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-ink/60">{t.cart.empty}</p>
            <Link href="/#planes" onClick={closeCart} className="btn-primary" tabIndex={isOpen ? 0 : -1}>
              {t.cart.emptyCta}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto p-5">
              {items.map((item) => {
                const price = unitPrice(item);
                return (
                  <li key={item.key} className="rounded-2xl border border-ink/10 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">
                          {item.kind === "plan" ? t.cart.plan : t.cart.uniform}
                          {item.kind === "uniform" && (
                            <span className="ml-2 rounded-md bg-ink/5 px-1.5 py-0.5 text-ink/70">
                              {t.cart.size}: {item.size}
                            </span>
                          )}
                        </p>
                        <p className="mt-1 font-bold leading-snug text-ink">{itemName(item, lang)}</p>
                        <p className="text-sm text-ink/60">{formatUSD(price)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/50 hover:bg-coral-50 hover:text-coral-600"
                        aria-label={`${t.cart.remove}: ${itemName(item, lang)}`}
                        tabIndex={isOpen ? 0 : -1}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <QuantityStepper
                        size="sm"
                        min={0}
                        value={item.quantity}
                        onChange={(q) => updateQuantity(item.key, q)}
                        decreaseLabel={t.store.decrease}
                        increaseLabel={t.store.increase}
                      />
                      <p className="font-bold text-ink">{formatUSD(price * item.quantity)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-ink/10 bg-white p-5">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-ink/70">
                  <dt>{t.cart.subtotal}</dt>
                  <dd>{formatUSD(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-lg font-extrabold text-ink">
                  <dt>{t.cart.total}</dt>
                  <dd>{formatUSD(subtotal)} USD</dd>
                </div>
              </dl>
              <Link href="/checkout" onClick={closeCart} className="btn-primary mt-4 w-full" tabIndex={isOpen ? 0 : -1}>
                {t.cart.checkout}
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="mt-2 w-full rounded-full py-2.5 text-sm font-bold text-ink/70 hover:text-ink"
                tabIndex={isOpen ? 0 : -1}
              >
                {t.cart.continue}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
