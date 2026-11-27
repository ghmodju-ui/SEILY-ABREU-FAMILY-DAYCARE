import { Suspense } from "react";
import CheckoutView from "@/components/CheckoutView";

export const metadata = {
  title: "Checkout | Seily Abreu Family Daycare",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <CheckoutView />
    </Suspense>
  );
}
