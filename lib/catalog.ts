// Single source of truth for products and prices.
// The API route re-computes totals from this file so prices can't be tampered with client-side.

export type Lang = "es" | "en";

export type PlanId = "basic" | "standard" | "extended" | "vip";
export type UniformId = "polo-basic" | "pants-basic" | "polo-sport" | "jogger-sport";

export const SIZES = ["2T", "3T", "4T", "XS", "S", "M", "L"] as const;
export type Size = (typeof SIZES)[number];

export interface Plan {
  id: PlanId;
  price: number;
  featured?: boolean;
  name: Record<Lang, string>;
  tagline: Record<Lang, string>;
  features: Record<Lang, string[]>;
}

export interface Uniform {
  id: UniformId;
  price: number;
  category: Record<Lang, string>;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    price: 100,
    name: { es: "Inscripción Básica", en: "Basic Enrollment" },
    tagline: { es: "Matrícula escolar", en: "School registration" },
    features: {
      es: ["Registro administrativo anual", "Evaluación inicial del niño", "Reserva de cupo"],
      en: ["Annual administrative registration", "Initial child assessment", "Guaranteed spot reservation"],
    },
  },
  {
    id: "standard",
    price: 150,
    name: { es: "Plan Estándar + Materiales", en: "Standard Plan + Supplies" },
    tagline: { es: "Lo esencial para empezar", en: "Everything to get started" },
    features: {
      es: [
        "Matrícula escolar completa",
        "Kit de materiales educativos bilingües",
        "Carpeta de seguimiento diario",
      ],
      en: ["Full school registration", "Bilingual learning materials kit", "Daily progress folder"],
    },
  },
  {
    id: "extended",
    price: 200,
    featured: true,
    name: { es: "Plan Horario Extendido", en: "Extended Hours Plan" },
    tagline: { es: "Ideal para padres con turnos largos", en: "Ideal for parents with long shifts" },
    features: {
      es: ["Inscripción", "Materiales educativos", "Acceso al horario extendido hasta las 11:30 p. m."],
      en: ["Enrollment", "Learning materials", "Extended-hours access until 11:30 p.m."],
    },
  },
  {
    id: "vip",
    price: 250,
    name: { es: "Paquete VIP Todo Incluido", en: "All-Inclusive VIP Package" },
    tagline: { es: "La experiencia completa", en: "The complete experience" },
    features: {
      es: [
        "Matrícula escolar",
        "Materiales educativos",
        "Acceso prioritario en horario completo",
        "Paquete de bienvenida para el estudiante",
      ],
      en: ["School registration", "Learning materials", "Priority full-schedule access", "Student welcome package"],
    },
  },
];

export const UNIFORMS: Uniform[] = [
  {
    id: "polo-basic",
    price: 50,
    category: { es: "Diario", en: "Everyday" },
    name: { es: "Poloché Básico Institucional", en: "Institutional Basic Polo" },
    description: {
      es: "Polo oficial de algodón transpirable con el logo bordado de la guardería.",
      en: "Official breathable cotton polo with the daycare's embroidered logo.",
    },
  },
  {
    id: "pants-basic",
    price: 50,
    category: { es: "Diario", en: "Everyday" },
    name: { es: "Pantalón Básico Institucional", en: "Institutional Basic Pants" },
    description: {
      es: "Pantalón cómodo y resistente de uso diario adaptado para actividades escolares.",
      en: "Comfortable, durable everyday pants made for school activities.",
    },
  },
  {
    id: "polo-sport",
    price: 50,
    category: { es: "Deporte", en: "Sports" },
    name: { es: "Poloché de Deporte", en: "Sports Polo" },
    description: {
      es: "Camiseta deportiva ligera y fresca diseñada para educación física y juegos al aire libre.",
      en: "Light, cool sports shirt designed for P.E. and outdoor play.",
    },
  },
  {
    id: "jogger-sport",
    price: 50,
    category: { es: "Deporte", en: "Sports" },
    name: { es: "Pantalón / Jogger de Deporte", en: "Sports Pants / Jogger" },
    description: {
      es: "Pantalón deportivo flexible de alta durabilidad para máxima movilidad.",
      en: "Flexible, highly durable sports pants for maximum mobility.",
    },
  },
];

export const BUSINESS = {
  name: "Seily Abreu Family Daycare",
  legalName: "Seily Abreu Family Day Care LLC",
  since: 2009,
};

export function findPlan(id: string) {
  return PLANS.find((p) => p.id === id);
}

export function findUniform(id: string) {
  return UNIFORMS.find((u) => u.id === id);
}

export function isSize(value: string): value is Size {
  return (SIZES as readonly string[]).includes(value);
}

export function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
