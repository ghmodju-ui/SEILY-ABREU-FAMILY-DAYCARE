export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-coral-500 text-white shadow-soft">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3.5 11L12 4l8.5 7" />
          <path d="M6 9.5V20h12V9.5" />
          <path d="M12 17.5s-3-1.9-3-3.9a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2-3 3.9-3 3.9z" fill="currentColor" stroke="none" />
        </svg>
        <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-cream bg-sun-400" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold text-ink">Seily Abreu</span>
        <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-teal-600">Family Daycare</span>
      </span>
    </span>
  );
}
