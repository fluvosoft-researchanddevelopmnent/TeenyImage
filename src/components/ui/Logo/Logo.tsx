import Link from "next/link";

import { APP_NAME } from "@/constants";
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
      <span className="text-[22px] font-bold leading-none tracking-tight sm:text-[26px]">{APP_NAME}</span>
    </Link>
  );
}
