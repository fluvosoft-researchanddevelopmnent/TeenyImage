import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-1 no-underline text-brand hover:text-brand-dark",
        className,
      )}
    >
      <span className="text-[22px] font-bold leading-none tracking-tight sm:text-[26px]">TeenyImage</span>
    </Link>
  );
}
