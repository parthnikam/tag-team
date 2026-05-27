import Link from "next/link";

export default function Page() {
  return (
    <main className="page-shell">
      <div className="page-heading-inset mx-auto flex min-h-[72vh] max-w-4xl flex-col items-center justify-center text-center">
        <h1 className="max-w-3xl text-[3.4rem] font-semibold leading-[0.95] tracking-[-0.07em] text-foreground sm:text-[4.9rem]">
          Run Toastmasters meetings smoothly.
        </h1>

        <p className="mt-5 max-w-xl text-[1rem] leading-7 text-muted-foreground sm:text-[1.1rem]">
          Minimal tools for Timer, Ah Counter, and Grammarian teams.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/room/create"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-colors"
          >
            Create meeting
          </Link>

          <Link
            href="/room/join"
            className="inline-flex items-center justify-center rounded-full border border-border px-8 py-3 text-base font-medium text-foreground transition-colors"
          >
            Join as TAG
          </Link>

          <Link
            href="/meetings"
            className="inline-flex items-center justify-center rounded-full border border-border px-8 py-3 text-base font-medium text-foreground transition-colors"
          >
            My meetings
          </Link>
        </div>
      </div>
    </main>
  );
}
