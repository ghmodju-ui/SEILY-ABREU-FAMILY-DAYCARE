# Seily Abreu Family Daycare — Sitio web

Next.js 15 (App Router) + Tailwind CSS + TypeScript. Bilingüe (ES/EN), carrito, tienda de uniformes, formulario de inscripción y checkout con PayKings.

## Ejecutar localmente

```bash
npm install
cp .env.example .env.local   # completa tus credenciales
npm run dev                  # http://localhost:3000
```

Sin `PAYKINGS_API_KEY` en desarrollo, los pagos se simulan (modo de prueba).

## Desplegar en Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. En Vercel: **Add New → Project** → importa el repositorio (Vercel detecta Next.js solo).
3. En **Settings → Environment Variables** agrega:

| Variable | Dónde se usa | Notas |
|---|---|---|
| `ENROLLMENT_WEBHOOK_URL` | Solo servidor | Recibe cada inscripción en JSON (Formspree, Zapier, Make…). **Obligatoria** para que el formulario funcione |
| `NEXT_PUBLIC_PAYKINGS_MERCHANT_ID` | Navegador y servidor | ID público del comercio |
| `PAYKINGS_API_KEY` | **Solo servidor** | Clave secreta (security key). Nunca la pongas con prefijo `NEXT_PUBLIC_` |
| `PAYKINGS_API_URL` | Solo servidor | Endpoint de transacciones que te da PayKings. Valor por defecto: `https://paykings.transactiongateway.com/api/transact.php` (confírmalo en tu portal) |
| `PAYKINGS_DEMO_MODE` | Solo servidor | `true` para simular pagos. Déjalo en `false` en producción |

## Estructura

```
app/
  layout.tsx                    Layout, fuentes, header/footer/carrito
  page.tsx                      Página principal (secciones)
  checkout/page.tsx             Vista de pago
  api/checkout/paykings/route.ts  Ruta API que procesa el pago
components/                     Header, Hero, Plans, UniformStore, EnrollmentForm, Contact, Footer, CartDrawer, CheckoutView…
context/                        LanguageContext (ES/EN), CartContext (carrito persistente)
lib/
  catalog.ts                    Planes, uniformes y precios (fuente única)
  i18n.ts                       Todos los textos en español e inglés
  payment.ts                    Validación de tarjeta (Luhn, vencimiento, CVV)
```

## Pago con PayKings

- El checkout pide **número de tarjeta, fecha de vencimiento y CVV** (obligatorios) y **nombre y correo** (opcionales).
- `POST /api/checkout/paykings` vuelve a calcular el total con `lib/catalog.ts` (los precios del navegador no se aceptan), valida la tarjeta y envía una transacción `sale` a PayKings. Respuestas: `200` aprobado, `402` rechazado, `400` datos inválidos, `502/503` error de pasarela.
- La ruta también acepta `paymentToken` en lugar de los datos de la tarjeta. Para reducir el alcance PCI, se recomienda usar los campos alojados / Collect.js de PayKings y enviar solo el token.

## Pendientes antes de producción

- **Formulario de inscripción:** configura `ENROLLMENT_WEBHOOK_URL` y haz un envío de prueba. Los datos incluyen información de menores: usa un destino privado.
- Agregar teléfono, dirección y correo del negocio a la sección de contacto.
- Agregar límite de intentos a la ruta de pago (protección contra pruebas de tarjetas robadas).
- Confirmar con PayKings el endpoint exacto y los nombres de campos de su API.
