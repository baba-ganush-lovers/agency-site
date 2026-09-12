import Link from "next/link";

// PLACEHOLDER: holding page. The hero replaces this at milestone 1 step 3.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-measure flex-col justify-center px-page py-7">
      <h1 className="text-display-sub font-display">This site is being built.</h1>
      <p className="mt-4 text-body text-fg/70">
        The type scale is the first thing under review.{" "}
        <Link href="/specimen" className="text-lime underline underline-offset-4">
          Read the specimen
        </Link>
        .
      </p>
    </main>
  );
}
