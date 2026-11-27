import type { Metadata, Viewport } from "next";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Providers from "@/components/Providers";
import "./globals.css";


export const metadata: Metadata = {
  title: "Seily Abreu Family Daycare | Cuidado infantil bilingüe · STAR 4",
  description:
    "Seily Abreu Family Day Care LLC: cuidado infantil grupal en el hogar, bilingüe (Español / Inglés), para niños de 1 a 13 años. Licencia estatal y calificación STAR 4 desde 2009.",
  openGraph: {
    title: "Seily Abreu Family Daycare",
    description: "Cuidado infantil bilingüe en el hogar para niños de 1 a 13 años. STAR 4 desde 2009.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF8EF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:wght@400;600;700;800&display=swap"
        />
      </head>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
