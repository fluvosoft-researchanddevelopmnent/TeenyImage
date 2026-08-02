import Link from "next/link";
import { ChevronDown, LayoutGrid } from "lucide-react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/layout/Container";
import { NAV_LINKS } from "@/constants";
import { cn } from "@/lib/utils/cn";

export function Header() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="border-b border-[#ececec] bg-white"
      color="inherit"
    >
      <Container as="div">
        <Toolbar disableGutters className="min-h-[64px] gap-4 lg:gap-5">
          <Logo />

          <nav className="hidden flex-1 items-center gap-4 lg:flex xl:gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wide text-[#555] no-underline transition-colors hover:text-[#333]",
                )}
              >
                {link.label}
                {"hasDropdown" in link && link.hasDropdown && (
                  <ChevronDown size={14} strokeWidth={2.5} className="mt-px" />
                )}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5 lg:gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-[#555] no-underline transition-colors hover:text-[#333] sm:inline-block"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-full bg-[#e5322d] px-5 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#d42b26]"
            >
              Sign up
            </Link>

            <button
              type="button"
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#666] transition-colors hover:bg-[#f5f5f5] hover:text-[#333]"
            >
              <LayoutGrid size={18} strokeWidth={2} />
            </button>
          </div>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
