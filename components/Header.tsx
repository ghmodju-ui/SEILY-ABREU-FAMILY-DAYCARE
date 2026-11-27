"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { CartIcon, ClockIcon, CloseIcon, MenuIcon, StarIcon } from "./Icons";
import LanguageToggle from "./LanguageToggle";
import Logo from "./Logo";

export default function Header() {
  const { t } = useLanguage();
  const { count, openCart, hydrated } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/#inicio", label: t.nav.home },
    { href: "/#planes", label: t.nav.plans },
    { href: "/#uniformes", label: t.nav.store },
    { href: "/#inscripcion", label: t.nav.enroll },
    { href: "/#contacto", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40">
      {/* Top bar */}
      <div className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-sun-400">
              <StarIcon className="h-3.5 w-3.5" />
              {t.topbar.star}
            </span>
            <span className="hidden items-center gap-1.5 text-white/80 md:flex">
              <ClockIcon className="h-3.5 w-3.5" />
              {t.topbar.hours}
            </span>
          </div>
          <LanguageToggle />
        </div>
      </div>

      {/* Main nav */}
      <nav
        className={`border-b transition-all ${
          scrolled ? "border-ink/10 bg-cream/95 shadow-sm backdrop-blur" : "border-transparent bg-cream"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/#inicio" aria-label="Seily Abreu Family Daycare" onClick={() => setMenuOpen(false)}>
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink/80 transition hover:bg-coral-50 hover:text-coral-600"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex items-center gap-2 rounded-full bg-coral-500 px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-coral-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-coral-100"
              aria-label={`${t.nav.cart} (${count})`}
            >
              <CartIcon />
              <span className="hidden sm:inline">{t.nav.cart}</span>
              <span
                className={`grid min-w-[1.4rem] place-items-center rounded-full bg-white px-1.5 text-xs font-extrabold text-coral-600 transition ${
                  hydrated ? "opacity-100" : "opacity-0"
                }`}
              >
                {count}
              </span>
            </button>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-ink/5 lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={t.nav.menu}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={`overflow-hidden border-t border-ink/10 bg-cream transition-[max-height] duration-300 lg:hidden ${
            menuOpen ? "max-h-96" : "max-h-0 border-transparent"
          }`}
        >
          <ul className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 font-semibold text-ink hover:bg-coral-50 hover:text-coral-600"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
