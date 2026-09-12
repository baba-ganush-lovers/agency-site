import Link from "next/link";
import { Container } from "@/components/layout/Container";

// PLACEHOLDER: holding page. The hero replaces this at milestone 1 step 3.
export default function Home() {
  return (
    <Container className="flex flex-1 flex-col justify-center py-7">
      <div className="max-w-measure">
        <h1 className="text-display-sub font-display">This site is being built.</h1>
        <p className="mt-4 text-body text-fg/70">
          The type scale is the first thing under review.{" "}
          <Link href="/specimen" className="text-lime underline underline-offset-4">
            Read the specimen
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}
