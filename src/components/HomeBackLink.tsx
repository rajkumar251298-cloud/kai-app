import Link from "next/link";

const linkClass =
  "inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[14px] font-medium leading-none text-[#C9A84C] transition-colors hover:text-[#F5E6B3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/30 rounded";

/** Gold ← Home / ← Back link — sits above page titles. */
export function HomeBackLink({
  className = "",
  noMarginBottom = false,
  /** Show "Back" but still navigate to home (e.g. chat). */
  labelBack = false,
  /** Render only the link (no pt/pl/mb wrapper) for tight headers. */
  bare = false,
}: {
  className?: string;
  noMarginBottom?: boolean;
  labelBack?: boolean;
  bare?: boolean;
}) {
  const link = (
    <Link href="/" className={`${linkClass} ${className}`.trim()}>
      <span aria-hidden>←</span>
      {labelBack ? "Back" : "Home"}
    </Link>
  );

  if (bare) {
    return link;
  }

  return (
    <div className={`pt-4 pl-5 ${noMarginBottom ? "" : "mb-2"}`}>{link}</div>
  );
}
