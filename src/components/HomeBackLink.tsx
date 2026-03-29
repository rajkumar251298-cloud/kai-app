import Link from "next/link";

/** Gold ← Home link — sits above page titles. */
export function HomeBackLink({
  className = "",
  noMarginBottom = false,
}: {
  className?: string;
  noMarginBottom?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-[#C9A84C] transition hover:text-[#F5E6B3] ${noMarginBottom ? "" : "mb-2"} ${className}`}
    >
      <span aria-hidden>←</span>
      Home
    </Link>
  );
}
