import Link from "next/link";

type Variant = "primary" | "secondary";

// All outbound commercial links go through here so they consistently carry
// rel="sponsored nofollow" and an inline affiliate disclosure is available.
export function AffiliateLink({
  href,
  children,
  variant = "primary",
  affiliate = true,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  affiliate?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-accent text-white hover:bg-accent-ink"
      : "border border-accent/30 bg-white text-accent hover:bg-accent-soft";
  return (
    <a
      href={href}
      target="_blank"
      rel={affiliate ? "sponsored nofollow noopener" : "nofollow noopener"}
      className={`${base} ${styles}`}
    >
      {children}
      <span aria-hidden className="ml-1.5">↗</span>
    </a>
  );
}

export function AffiliateDisclosureNote() {
  return (
    <p className="text-xs text-ink/50">
      Some buttons above are{" "}
      <Link href="/affiliate-disclosure" className="underline hover:text-accent">
        affiliate links
      </Link>
      . We may earn a commission — it never changes our verdict.
    </p>
  );
}
