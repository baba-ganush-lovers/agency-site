import type { Metadata } from "next";
import { Schibsted_Grotesk, Syne } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { brand } from "@/config/brand";
import "./globals.css";

// An explicit weight array requests discrete static instances rather than the
// variable file — small fixed faces instead of axis ranges we've ruled out
// using. Syne is 600 only: there is one display register. See
// docs/type-system.md.
//
// The automatic fallback is off: next/font sized it from a font-wide average
// and it rendered the headline 15% too narrow, so the hero re-wrapped when
// Syne arrived. "Syne Fallback" is declared in globals.css with values
// measured against the actual headline.
const syne = Syne({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-syne",
  adjustFontFallback: false,
  fallback: ["Syne Fallback"],
});

const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-schibsted",
});

export const metadata: Metadata = {
  title: brand.name,
  description:
    "A two-person studio building software and the data that tells you whether it works.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${schibstedGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col font-text text-fg">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
