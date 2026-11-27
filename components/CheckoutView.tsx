"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { unitPrice, useCart, type CartItem } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { findPlan, formatUSD, type PlanId } from "@/lib/catalog";
import { fill } from "@/lib/i18n";
import {
  cvvValid,
  digitsOnly,
  emailValid,
  formatCardNumber,
  formatExpiry,
  luhnValid,
  parseExpiry,
} from "@/lib/payment";
import { itemName } from "./CartDrawer";
import { CheckIcon, LockIcon } from "./Icons";

interface PayForm {
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
  email: string;
}

type PayErrors = Partial<Record<keyof PayForm, string>>;

interface PaymentResult {
  transactionId: string;
  amount: number;
  demo: boolean;
}

export default function CheckoutView() {
  const { t, lang } = useLanguage();
  const cart = useCart();
  const params = useSearchParams();

  // "Pay now" on a plan card opens /checkout?plan=<id> — a direct purchase that skips the cart.
  const directPlan = params.get("plan");
  const directItem = useMemo<CartItem | null>(
    () =>
      directPlan && findPlan(directPlan)
        ? { key: `plan:${directPlan}`, kind: "plan", productId: directPlan as PlanId, quantity: 1 }
        : null,
    [directPlan],
  );

  const items = useMemo(() => (directItem ? [directItem] : cart.items), [directItem, cart.items]);
  const total = items.reduce((sum, i) => sum + unitPrice(i) * i.quantity, 0);

  const [form, setForm] = useState<PayForm>({ cardNumber: "", expiry: "", cvv: "", name: "", email: "" });
  const [errors, setErrors] = useState<PayErrors>({});
  const [processing, setProcessing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const update = (key: keyof PayForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): PayErrors => {
    const e: PayErrors = {};
    if (!luhnValid(form.cardNumber)) e.cardNumber = t.checkout.errors.cardNumber;
    if (!parseExpiry(form.expiry)) e.expiry = t.checkout.errors.expiry;
    if (!cvvValid(form.cvv)) e.cvv = t.checkout.errors.cvv;
    if (form.email.trim() && !emailValid(form.email)) e.email = t.checkout.errors.email;
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError(null);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`pay-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/checkout/paykings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            kind: i.kind,
            productId: i.productId,
            size: i.kind === "uniform" ? i.size : undefined,
            quantity: i.quantity,
          })),
          card: {
            number: digitsOnly(form.cardNumber),
            expiry: digitsOnly(form.expiry),
            cvv: form.cvv,
          },
          name: form.name.trim() || undefined,
          email: form.email.trim() || undefined,
          lang,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setServerError(typeof data.message === "string" && data.message ? data.message : t.checkout.errors.generic);
        return;
      }
      setResult({ transactionId: data.transactionId, amount: data.amount, demo: Boolean(data.demo) });
      if (!directItem) cart.clearCart();
    } catch {
      setServerError(t.checkout.errors.generic);
    } finally {
      setProcessing(false);
    }
  };

  if (result) {
    return (
      <section className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-teal-50 text-teal-600">
          <CheckIcon className="h-10 w-10" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">{t.checkout.successTitle}</h1>
        <p className="mt-3 text-ink/70">{t.checkout.successText}</p>
        <p className="mt-2 font-mono text-lg font-bold text-ink">{result.transactionId}</p>
        <p className="mt-1 font-semibold text-ink/70">{formatUSD(result.amount)} USD</p>
        {result.demo && (
          <p className="mx-auto mt-5 max-w-sm rounded-xl bg-sun-100 px-4 py-2 text-sm font-semibold text-ink">
            {t.checkout.demoNote}
          </p>
        )}
        <Link href="/" className="btn-primary mt-8">
          {t.checkout.successHome}
        </Link>
      </section>
    );
  }

  const field = (key: keyof PayForm) =>
    `input ${errors[key] ? "border-coral-500 focus:border-coral-500 focus:ring-coral-100" : ""}`;
  const aria = (key: keyof PayForm) => ({
    id: `pay-${key}`,
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `pay-${key}-error` : undefined,
  });
  const Err = ({ k }: { k: keyof PayForm }) =>
    errors[k] ? (
      <p id={`pay-${k}-error`} className="mt-1.5 text-sm font-semibold text-coral-600">
        {errors[k]}
      </p>
    ) : null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/#planes" className="text-sm font-bold text-ink/60 hover:text-ink">
        ← {t.checkout.back}
      </Link>
      <h1 className="mt-3 flex items-center gap-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
        {t.checkout.title}
        <LockIcon className="h-6 w-6 text-teal-600" />
      </h1>

      {!cart.hydrated && !directItem ? (
        <div className="min-h-[40vh]" />
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-ink/10 bg-white p-10 text-center">
          <p className="text-ink/70">{t.checkout.empty}</p>
          <Link href="/#planes" className="btn-primary mt-5">
            {t.cart.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          {/* Payment form */}
          <form onSubmit={handleSubmit} noValidate className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="form-legend">{t.checkout.payment}</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="pay-cardNumber" className="label">{t.checkout.cardNumber} *</label>
                <input
                  {...aria("cardNumber")}
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  className={`${field("cardNumber")} font-mono tracking-wider`}
                  value={form.cardNumber}
                  onChange={(e) => update("cardNumber", formatCardNumber(e.target.value))}
                />
                <Err k="cardNumber" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pay-expiry" className="label">{t.checkout.expiry} *</label>
                  <input
                    {...aria("expiry")}
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder={lang === "es" ? "MM/AA" : "MM/YY"}
                    className={`${field("expiry")} font-mono`}
                    value={form.expiry}
                    onChange={(e) => update("expiry", formatExpiry(e.target.value))}
                  />
                  <Err k="expiry" />
                </div>
                <div>
                  <label htmlFor="pay-cvv" className="label">{t.checkout.cvv} *</label>
                  <input
                    {...aria("cvv")}
                    type="password"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="•••"
                    maxLength={4}
                    className={`${field("cvv")} font-mono`}
                    value={form.cvv}
                    onChange={(e) => update("cvv", digitsOnly(e.target.value).slice(0, 4))}
                  />
                  <Err k="cvv" />
                </div>
              </div>

              <div>
                <label htmlFor="pay-name" className="label">
                  {t.checkout.name} <span className="font-semibold text-ink/40">({t.checkout.optional})</span>
                </label>
                <input
                  {...aria("name")}
                  type="text"
                  autoComplete="cc-name"
                  className={field("name")}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="pay-email" className="label">
                  {t.checkout.email} <span className="font-semibold text-ink/40">({t.checkout.optional})</span>
                </label>
                <input
                  {...aria("email")}
                  type="email"
                  autoComplete="email"
                  className={field("email")}
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
                {errors.email ? <Err k="email" /> : <p className="mt-1.5 text-xs text-ink/50">{t.checkout.emailHint}</p>}
              </div>
            </div>

            {serverError && (
              <p role="alert" className="mt-5 rounded-xl bg-coral-50 px-4 py-3 text-sm font-semibold text-coral-700">
                {serverError}
              </p>
            )}

            <button type="submit" disabled={processing} className="btn-primary mt-6 w-full py-4 text-base">
              <LockIcon />
              {processing ? t.checkout.processing : fill(t.checkout.pay, { amount: formatUSD(total) })}
            </button>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink/50">
              <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t.checkout.secure}
            </p>
          </form>

          {/* Order summary */}
          <aside className="rounded-3xl bg-ink p-6 text-white sm:p-8 lg:sticky lg:top-36">
            <h2 className="font-display text-lg font-semibold">{t.checkout.summary}</h2>
            <ul className="mt-5 divide-y divide-white/10">
              {items.map((i) => (
                <li key={i.key} className="flex justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-bold">{itemName(i, lang)}</p>
                    <p className="text-white/60">
                      {i.kind === "uniform" ? `${t.cart.size} ${i.size} · ` : ""}
                      {i.quantity} × {formatUSD(unitPrice(i))}
                    </p>
                  </div>
                  <p className="font-bold">{formatUSD(unitPrice(i) * i.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-white/70">
                <dt>{t.cart.subtotal}</dt>
                <dd>{formatUSD(total)}</dd>
              </div>
              <div className="flex justify-between text-xl font-extrabold">
                <dt>{t.cart.total}</dt>
                <dd>{formatUSD(total)} USD</dd>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </section>
  );
}
