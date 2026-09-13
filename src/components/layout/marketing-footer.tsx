import Link from "next/link";

export function MarketingFooter({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div>
            <Link className="text-xl font-semibold tracking-tight" href="/">
              Careerly
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Connecting people with opportunities and teams with talent.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-start gap-x-6 gap-y-3 text-sm font-medium"
          >
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/#how-it-works"
            >
              How it works
            </Link>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/#faq"
            >
              FAQ
            </Link>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/pricing"
            >
              Pricing
            </Link>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href={href}
            >
              {label}
            </Link>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Careerly</p>
          <p>Better careers. Stronger teams.</p>
        </div>
      </div>
    </footer>
  );
}
