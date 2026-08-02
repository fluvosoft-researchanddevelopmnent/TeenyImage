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
        "inline-flex items-center gap-1 no-underline text-[#333] hover:text-[#333]",
        className,
      )}
    >
      <span className="text-[26px] font-bold leading-none tracking-tight">{APP_NAME}</span>
    </Link>
  );
}
