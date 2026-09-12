import type { Metadata } from "next";
import { Schibsted_Grotesk, Syne } from "next/font/google";
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
  // PLACEHOLDER: the studio has no name yet. Deliberately a description rather
  // than a name, so nothing has to be un-invented later.
  title: "Software and data studio",
  description:
    "A two-person studio building software and the data that tells you whether it works.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${schibstedGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full font-text text-fg">{children}</body>
    </html>
  );
}
