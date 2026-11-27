import { NextResponse } from "next/server";
import { emailValid } from "@/lib/payment";

// Forwards enrollment requests to ENROLLMENT_WEBHOOK_URL (server-side only).
// The data includes information about children, so it is never logged.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCHEDULES = ["morning", "afternoon", "fullday", "evening"];

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", 400);

  const b = body as Record<string, unknown>;
  const es = b.lang !== "en";
  const data = {
    childName: str(b.childName, 120),
    childAge: Number(b.childAge),
    medical: str(b.medical, 2000),
    guardianName: str(b.guardianName, 120),
    phone: str(b.phone, 40),
    email: str(b.email, 254),
    schedule: str(b.schedule, 20),
  };

  const valid =
    data.childName.split(/\s+/).length >= 2 &&
    Number.isInteger(data.childAge) &&
    data.childAge >= 1 &&
    data.childAge <= 13 &&
    data.guardianName.length >= 2 &&
    data.phone.replace(/\D/g, "").length >= 10 &&
    emailValid(data.email) &&
    SCHEDULES.includes(data.schedule);
  if (!valid) return fail(es ? "Revisa los datos del formulario." : "Please check the form details.", 400);

  const unavailable = es
    ? "No se pudo enviar la inscripción en este momento. Intenta más tarde."
    : "The enrollment could not be sent right now. Please try again later.";

  const url = process.env.ENROLLMENT_WEBHOOK_URL;
  if (!url) {
    console.error("[enrollment] ENROLLMENT_WEBHOOK_URL is not configured.");
    return fail(unavailable, 503);
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...data, submittedAt: new Date().toISOString() }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      console.error("[enrollment] webhook HTTP error", res.status);
      return fail(unavailable, 502);
    }
  } catch {
    console.error("[enrollment] webhook request failed");
    return fail(unavailable, 502);
  }

  return NextResponse.json({ success: true });
}
