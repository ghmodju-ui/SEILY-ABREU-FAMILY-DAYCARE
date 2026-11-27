import { NextResponse } from "next/server";
import { findPlan, findUniform, isSize } from "@/lib/catalog";
import { cvvValid, digitsOnly, emailValid, luhnValid, parseExpiry } from "@/lib/payment";

// Runs on the server only. PAYKINGS_API_KEY is never exposed to the browser.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_GATEWAY_URL = "https://paykings.transactiongateway.com/api/transact.php";
const MAX_QTY = 20;

interface IncomingItem {
  kind?: unknown;
  productId?: unknown;
  size?: unknown;
  quantity?: unknown;
}

interface IncomingBody {
  items?: IncomingItem[];
  card?: { number?: unknown; expiry?: unknown; cvv?: unknown };
  /** Optional: a token from PayKings Collect.js / hosted fields, used instead of raw card data. */
  paymentToken?: unknown;
  name?: unknown;
  email?: unknown;
  lang?: unknown;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

/** Re-prices the order from the server-side catalog so client prices can't be tampered with. */
function priceOrder(items: IncomingItem[]) {
  const lines: string[] = [];
  let total = 0;
  for (const raw of items) {
    if (!raw || typeof raw !== "object") return null;
    const qty = Number(raw.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return null;
    const id = str(raw.productId);
    if (raw.kind === "plan") {
      const plan = findPlan(id);
      if (!plan) return null;
      total += plan.price * qty;
      lines.push(`${plan.name.en} x${qty}`);
    } else if (raw.kind === "uniform") {
      const uniform = findUniform(id);
      const size = str(raw.size);
      if (!uniform || !isSize(size)) return null;
      total += uniform.price * qty;
      lines.push(`${uniform.name.en} (${size}) x${qty}`);
    } else {
      return null;
    }
  }
  return { total, description: lines.join("; ").slice(0, 255) };
}

export async function POST(request: Request) {
  let body: IncomingBody;
  try {
    body = (await request.json()) as IncomingBody;
  } catch {
    return fail("Invalid request body.");
  }
  if (!body || typeof body !== "object") return fail("Invalid request body.");

  const es = body.lang !== "en";
  const msg = (spanish: string, english: string) => (es ? spanish : english);

  // 1. Validate and price the order.
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    return fail(msg("El carrito está vacío o no es válido.", "The cart is empty or invalid."));
  }
  const order = priceOrder(body.items);
  if (!order || order.total <= 0) {
    return fail(msg("El pedido contiene artículos no válidos.", "The order contains invalid items."));
  }

  // 2. Validate payment details. Required: card number, expiry, CVV. Optional: name, email.
  const paymentToken = str(body.paymentToken);
  const cardNumber = digitsOnly(str(body.card?.number));
  const expiry = parseExpiry(str(body.card?.expiry));
  const cvv = str(body.card?.cvv);
  const name = str(body.name).slice(0, 100);
  const email = str(body.email).slice(0, 254);

  if (!paymentToken) {
    if (!luhnValid(cardNumber)) return fail(msg("Número de tarjeta inválido.", "Invalid card number."));
    if (!expiry) return fail(msg("Fecha de vencimiento inválida.", "Invalid expiration date."));
    if (!cvvValid(cvv)) return fail(msg("CVV inválido.", "Invalid CVV."));
  }
  if (email && !emailValid(email)) return fail(msg("Correo electrónico inválido.", "Invalid email address."));

  const amount = order.total.toFixed(2);
  const orderId = `SAD-${Date.now().toString(36).toUpperCase()}`;

  // 3. Demo mode: simulate an approval without contacting PayKings.
  const apiKey = process.env.PAYKINGS_API_KEY;
  const demo =
    process.env.PAYKINGS_DEMO_MODE === "true" || (!apiKey && process.env.NODE_ENV !== "production");

  if (demo) {
    return NextResponse.json({
      success: true,
      demo: true,
      transactionId: `DEMO-${orderId}`,
      orderId,
      amount: Number(amount),
    });
  }

  if (!apiKey) {
    console.error("[paykings] PAYKINGS_API_KEY is not configured.");
    return fail(
      msg("La pasarela de pago no está configurada. Intenta más tarde.", "The payment gateway is not configured. Please try later."),
      503,
    );
  }

  // 4. Build the PayKings transaction payload (form-encoded "sale").
  const [firstName, ...rest] = name.split(/\s+/).filter(Boolean);
  const payload = new URLSearchParams({
    security_key: apiKey,
    type: "sale",
    amount,
    currency: "USD",
    orderid: orderId,
    order_description: order.description,
  });
  if (paymentToken) {
    payload.set("payment_token", paymentToken);
  } else {
    payload.set("ccnumber", cardNumber);
    payload.set("ccexp", expiry as string);
    payload.set("cvv", cvv);
  }
  if (firstName) payload.set("first_name", firstName);
  if (rest.length) payload.set("last_name", rest.join(" "));
  if (email) payload.set("email", email);
  const merchantId = process.env.NEXT_PUBLIC_PAYKINGS_MERCHANT_ID;
  if (merchantId) payload.set("merchant_defined_field_1", merchantId);

  // 5. Send to PayKings and interpret the response.
  try {
    const res = await fetch(process.env.PAYKINGS_API_URL || DEFAULT_GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      console.error("[paykings] gateway HTTP error", res.status);
      return fail(msg("La pasarela de pago no respondió. Intenta de nuevo.", "The payment gateway did not respond. Please try again."), 502);
    }

    // The gateway answers with a query string: response=1|2|3&responsetext=...&transactionid=...
    const result = new URLSearchParams(await res.text());
    const code = result.get("response");
    const transactionId = result.get("transactionid") ?? "";

    if (code === "1") {
      return NextResponse.json({
        success: true,
        demo: false,
        transactionId,
        authCode: result.get("authcode") ?? undefined,
        orderId,
        amount: Number(amount),
      });
    }

    const reason = result.get("responsetext") ?? "";
    console.warn("[paykings] transaction not approved", { code, reason, orderId });
    return fail(
      code === "2"
        ? msg("La tarjeta fue rechazada. Verifica los datos o usa otra tarjeta.", "The card was declined. Check the details or use another card.")
        : msg(`No se pudo procesar el pago. ${reason}`.trim(), `The payment could not be processed. ${reason}`.trim()),
      402,
    );
  } catch (error) {
    console.error("[paykings] request failed", error instanceof Error ? error.message : error);
    return fail(msg("Error de conexión con la pasarela de pago.", "Connection error with the payment gateway."), 502);
  }
}

export function GET() {
  return NextResponse.json({ success: false, message: "Method not allowed." }, { status: 405 });
}
