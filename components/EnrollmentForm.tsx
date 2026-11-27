"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { fill } from "@/lib/i18n";
import { CheckIcon } from "./Icons";

type Schedule = "morning" | "afternoon" | "fullday" | "evening";

interface FormState {
  childName: string;
  childAge: string;
  medical: string;
  guardianName: string;
  phone: string;
  email: string;
  schedule: Schedule | "";
}

type Errors = Partial<Record<keyof FormState, string>>;

const initial: FormState = {
  childName: "",
  childAge: "",
  medical: "",
  guardianName: "",
  phone: "",
  email: "",
  schedule: "",
};

export default function EnrollmentForm() {
  const { t, lang } = useLanguage();
  const { hasPlan, addPlan, openCart } = useCart();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ guardian: string; child: string } | null>(null);

  const [sendError, setSendError] = useState<string | null>(null);

  const feeInCart = hasPlan("basic");

  const validate = (f: FormState): Errors => {
    const e: Errors = {};
    if (f.childName.trim().split(/\s+/).filter(Boolean).length < 2) e.childName = t.enroll.errors.childName;
    const age = Number(f.childAge);
    if (!f.childAge || !Number.isInteger(age) || age < 1 || age > 13) e.childAge = t.enroll.errors.childAge;
    if (f.guardianName.trim().length < 2) e.guardianName = t.enroll.errors.guardianName;
    if (f.phone.replace(/\D/g, "").length < 10) e.phone = t.enroll.errors.phone;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = t.enroll.errors.email;
    if (!f.schedule) e.schedule = t.enroll.errors.schedule;
    return e;
  };

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0];
      document.getElementById(`enroll-${first}`)?.focus();
      return;
    }
    setSendError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lang }),
      });
      const data = await res.json().catch(() => ({}));
      // Confirm on screen only when the server says the data was really delivered.
      if (!res.ok || !data.success) {
        setSendError(typeof data.message === "string" && data.message ? data.message : t.enroll.sendError);
        return;
      }
      setSubmitted({ guardian: form.guardianName.trim().split(/\s+/)[0], child: form.childName.trim() });
      setForm(initial);
    } catch {
      setSendError(t.enroll.sendError);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: keyof FormState) =>
    `input ${errors[key] ? "border-coral-500 focus:border-coral-500 focus:ring-coral-100" : ""}`;

  const ErrorText = ({ name }: { name: keyof FormState }) =>
    errors[name] ? (
      <p id={`enroll-${name}-error`} className="mt-1.5 text-sm font-semibold text-coral-600">
        {errors[name]}
      </p>
    ) : null;

  const aria = (name: keyof FormState) => ({
    id: `enroll-${name}`,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `enroll-${name}-error` : undefined,
  });

  return (
    <section id="inscripcion" className="scroll-mt-32 py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">{t.enroll.eyebrow}</p>
          <h2 className="section-title">{t.enroll.title}</h2>
          <p className="mt-3 text-ink/70">{t.enroll.subtitle}</p>
          <div className="mt-8 hidden rounded-3xl bg-teal-600 p-6 text-white lg:block">
            <p className="font-display text-2xl font-semibold">STAR 4</p>
            <p className="mt-2 text-sm text-white/80">{t.contact.accreditationValue}</p>
            <p className="mt-4 text-sm text-white/80">{t.contact.hoursValue}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
          {submitted ? (
            <div role="status" className="py-4 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-50 text-teal-600">
                <CheckIcon className="h-8 w-8" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-ink">{t.enroll.successTitle}</h3>
              <p className="mx-auto mt-2 max-w-md text-ink/70">
                {fill(t.enroll.successText, { name: submitted.guardian, child: submitted.child })}
              </p>

              <div className="mx-auto mt-6 max-w-md rounded-2xl bg-cream p-5 text-left">
                {feeInCart ? (
                  <p className="flex items-center gap-2 font-semibold text-teal-700">
                    <CheckIcon className="h-5 w-5" /> {t.enroll.feeInCart}
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-ink/80">{t.enroll.addFeeQuestion}</p>
                    <button type="button" onClick={() => addPlan("basic")} className="btn-primary mt-4 w-full">
                      {t.enroll.addFee}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={openCart} className="btn-secondary">
                  {t.enroll.goToCart}
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitted(null)}
                  className="rounded-full px-5 py-3 text-sm font-bold text-ink/70 hover:text-ink"
                >
                  {t.enroll.newForm}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              <fieldset>
                <legend className="form-legend">{t.enroll.childSection}</legend>
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_10rem]">
                  <div>
                    <label htmlFor="enroll-childName" className="label">{t.enroll.childName} *</label>
                    <input
                      {...aria("childName")}
                      type="text"
                      autoComplete="off"
                      className={field("childName")}
                      value={form.childName}
                      onChange={(e) => update("childName", e.target.value)}
                    />
                    <ErrorText name="childName" />
                  </div>
                  <div>
                    <label htmlFor="enroll-childAge" className="label">{t.enroll.childAge} *</label>
                    <input
                      {...aria("childAge")}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={13}
                      className={field("childAge")}
                      value={form.childAge}
                      onChange={(e) => update("childAge", e.target.value)}
                    />
                    <ErrorText name="childAge" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="enroll-medical" className="label">{t.enroll.medical}</label>
                    <textarea
                      id="enroll-medical"
                      rows={3}
                      className="input resize-y"
                      placeholder={t.enroll.medicalPlaceholder}
                      value={form.medical}
                      onChange={(e) => update("medical", e.target.value)}
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="form-legend">{t.enroll.guardianSection}</legend>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="enroll-guardianName" className="label">{t.enroll.guardianName} *</label>
                    <input
                      {...aria("guardianName")}
                      type="text"
                      autoComplete="name"
                      className={field("guardianName")}
                      value={form.guardianName}
                      onChange={(e) => update("guardianName", e.target.value)}
                    />
                    <ErrorText name="guardianName" />
                  </div>
                  <div>
                    <label htmlFor="enroll-phone" className="label">{t.enroll.phone} *</label>
                    <input
                      {...aria("phone")}
                      type="tel"
                      autoComplete="tel"
                      className={field("phone")}
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                    <ErrorText name="phone" />
                  </div>
                  <div>
                    <label htmlFor="enroll-email" className="label">{t.enroll.email} *</label>
                    <input
                      {...aria("email")}
                      type="email"
                      autoComplete="email"
                      className={field("email")}
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                    <ErrorText name="email" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="enroll-schedule" className="label">{t.enroll.schedule} *</label>
                    <select
                      {...aria("schedule")}
                      className={field("schedule")}
                      value={form.schedule}
                      onChange={(e) => update("schedule", e.target.value as Schedule | "")}
                    >
                      <option value="">{t.enroll.schedulePlaceholder}</option>
                      {(Object.keys(t.enroll.schedules) as Schedule[]).map((k) => (
                        <option key={k} value={k}>
                          {t.enroll.schedules[k]}
                        </option>
                      ))}
                    </select>
                    <ErrorText name="schedule" />
                  </div>
                </div>
              </fieldset>

              {sendError && (
                <p role="alert" className="rounded-xl bg-coral-50 px-4 py-3 text-sm font-semibold text-coral-700">
                  {sendError}
                </p>
              )}

              <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
                {submitting ? t.enroll.sending : t.enroll.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
