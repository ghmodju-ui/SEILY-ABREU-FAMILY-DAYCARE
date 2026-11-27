"use client";

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  decreaseLabel: string;
  increaseLabel: string;
  size?: "sm" | "md";
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  decreaseLabel,
  increaseLabel,
  size = "md",
}: Props) {
  const btn = size === "sm" ? "h-8 w-8 text-base" : "h-10 w-10 text-lg";
  return (
    <div className="inline-flex items-center rounded-full border border-ink/10 bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={decreaseLabel}
        className={`${btn} grid place-items-center rounded-full font-bold text-ink transition hover:bg-ink/5 disabled:opacity-30`}
      >
        −
      </button>
      <span className={`${size === "sm" ? "w-7 text-sm" : "w-9"} text-center font-bold tabular-nums text-ink`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={increaseLabel}
        className={`${btn} grid place-items-center rounded-full font-bold text-ink transition hover:bg-ink/5 disabled:opacity-30`}
      >
        +
      </button>
    </div>
  );
}
