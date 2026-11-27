"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { findPlan, findUniform, isSize, type PlanId, type Size, type UniformId } from "@/lib/catalog";

export type CartItem =
  | { key: string; kind: "plan"; productId: PlanId; quantity: number }
  | { key: string; kind: "uniform"; productId: UniformId; size: Size; quantity: number };

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  hydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  addPlan: (id: PlanId) => void;
  addUniform: (id: UniformId, size: Size, quantity: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  hasPlan: (id: PlanId) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "sad-cart";
const MAX_QTY = 20;

export function unitPrice(item: CartItem) {
  const product = item.kind === "plan" ? findPlan(item.productId) : findUniform(item.productId);
  return product?.price ?? 0;
}

function isValidItem(raw: unknown): raw is CartItem {
  if (!raw || typeof raw !== "object") return false;
  const i = raw as Record<string, unknown>;
  if (typeof i.key !== "string" || typeof i.quantity !== "number") return false;
  if (!Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > MAX_QTY) return false;
  if (i.kind === "plan") return Boolean(findPlan(String(i.productId)));
  if (i.kind === "uniform") return Boolean(findUniform(String(i.productId))) && typeof i.size === "string" && isSize(i.size);
  return false;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed.filter(isValidItem));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items, hydrated]);

  const addPlan = useCallback((id: PlanId) => {
    setItems((prev) => {
      const key = `plan:${id}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QTY) } : i));
      }
      return [...prev, { key, kind: "plan", productId: id, quantity: 1 }];
    });
  }, []);

  const addUniform = useCallback((id: UniformId, size: Size, quantity: number) => {
    setItems((prev) => {
      const key = `uniform:${id}:${size}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_QTY) } : i,
        );
      }
      return [...prev, { key, kind: "uniform", productId: id, size, quantity: Math.min(quantity, MAX_QTY) }];
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(quantity, MAX_QTY) } : i)),
    );
  }, []);

  const removeItem = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const clearCart = useCallback(() => setItems([]), []);
  const hasPlan = useCallback(
    (id: PlanId) => items.some((i) => i.kind === "plan" && i.productId === id),
    [items],
  );

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + unitPrice(i) * i.quantity, 0);
    return {
      items,
      count,
      subtotal,
      isOpen,
      hydrated,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addPlan,
      addUniform,
      updateQuantity,
      removeItem,
      clearCart,
      hasPlan,
    };
  }, [items, isOpen, hydrated, addPlan, addUniform, updateQuantity, removeItem, clearCart, hasPlan]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
