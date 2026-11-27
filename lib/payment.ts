// Shared card validation helpers (used by the checkout form and the API route).

export const digitsOnly = (v: string) => v.replace(/\D/g, "");

export function luhnValid(num: string) {
  const d = digitsOnly(num);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

/** Accepts "MM/YY" or "MMYY". Returns "MMYY" or null when invalid/expired. */
export function parseExpiry(value: string, now = new Date()): string | null {
  const d = digitsOnly(value);
  if (d.length !== 4) return null;
  const month = Number(d.slice(0, 2));
  const year = 2000 + Number(d.slice(2));
  if (month < 1 || month > 12) return null;
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  if (endOfMonth < now) return null;
  return d;
}

export const cvvValid = (v: string) => /^\d{3,4}$/.test(v);

export const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function formatCardNumber(v: string) {
  return digitsOnly(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(v: string) {
  const d = digitsOnly(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
