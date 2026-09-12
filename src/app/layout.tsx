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
const syne = Syne({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-syne",
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
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
