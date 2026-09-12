import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Container } from "@/components/layout/Container";

// PLACEHOLDER: "Contact" points at a mailto stand-in — the studio has no real
// address yet. studio.example is the RFC 2606 reserved domain, so it reads as
// a placeholder rather than a broken real one. See PLACEHOLDERS.md.
const CONTACT_EMAIL = "hello@studio.example";

export function Header() {
  return (
    <header className="py-4">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <Link href="/">
          <Wordmark />
        </Link>
        <nav aria-label="Primary">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-body underline decoration-fg/30 underline-offset-4 hover:decoration-fg"
          >
            Contact
          </a>
        </nav>
      </Container>
    </header>
  );
}
