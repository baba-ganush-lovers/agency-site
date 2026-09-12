import { brand } from "@/config/brand";
import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="py-6">
      <Container className="border-t border-fg/10 pt-4">
        <p className="text-small text-fg/60">
          © {new Date().getFullYear()} {brand.name}
        </p>
      </Container>
    </footer>
  );
}
