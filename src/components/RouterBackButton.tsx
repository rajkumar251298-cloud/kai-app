"use client";

import { useRouter } from "next/navigation";

const btnClass =
  "inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[14px] font-medium leading-none text-[#C9A84C] transition-colors hover:text-[#F5E6B3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]/30 rounded";

const rowClass = "mb-2 pt-4 pl-5";

type Props = {
  className?: string;
  /** Render only the button (no pt/pl/mb wrapper) for tight layouts. */
  bare?: boolean;
};

export function RouterBackButton({ className = "", bare = false }: Props) {
  const router = useRouter();

  const button = (
    <button
      type="button"
      onClick={() => router.back()}
      className={`${btnClass} ${bare ? className : ""}`.trim()}
    >
      <span aria-hidden>←</span>
      Back
    </button>
  );

  if (bare) {
    return button;
  }

  return <div className={`${rowClass} ${className}`.trim()}>{button}</div>;
}
