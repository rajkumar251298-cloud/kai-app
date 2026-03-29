"use client";

import {
  type FormEvent,
  type RefObject,
  useCallback,
} from "react";

export const KAI_TEXTAREA_MAX_PX = 120;

export function useAutoGrowTextarea() {
  const onInput = useCallback(
    (e: FormEvent<HTMLTextAreaElement>) => {
      const el = e.currentTarget;
      el.style.height = "auto";
      const next = Math.min(el.scrollHeight, KAI_TEXTAREA_MAX_PX);
      el.style.height = `${next}px`;
      el.style.overflowY =
        el.scrollHeight > KAI_TEXTAREA_MAX_PX ? "auto" : "hidden";
    },
    [],
  );
  return onInput;
}

export function scrollInputIntoView(
  inputRef: RefObject<HTMLElement | null>,
): void {
  setTimeout(() => {
    inputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 300);
}
