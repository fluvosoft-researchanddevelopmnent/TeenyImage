"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/layout/Container";
import { NAV_LINKS, IMAGE_TOOLS } from "@/constants";
import { useApp } from "@/context/AppContext";

export function Header() {
  const { searchQuery, setSearchQuery } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchResults = searchQuery.trim()
    ? IMAGE_TOOLS.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="border-b border-border bg-background/90 backdrop-blur-md"
      color="inherit"
    >
      <Container as="div">
        <Toolbar disableGutters className="min-h-[56px] gap-2 sm:min-h-[64px] sm:gap-3 lg:gap-4">
          <Logo className="shrink-0" />

          <nav className="hidden items-center gap-4 lg:flex xl:gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex items-center gap-1 text-[13px] font-semibold tracking-wide text-text-secondary no-underline transition-colors hover:text-brand"
              >
                {link.label}
                {"hasDropdown" in link && link.hasDropdown && (
                  <ChevronDown size={14} strokeWidth={2.5} className="mt-px" />
                )}
              </Link>
            ))}
          </nav>

          <div className="relative ml-auto min-w-0 flex-1 max-w-[10rem] sm:max-w-xs">
            <div className="relative">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary/50 sm:left-3" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 150)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                aria-label="Search tools and files"
                className="w-full rounded-full border border-border bg-surface py-1.5 pl-8 pr-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-brand sm:pl-9 sm:pr-3"
              />
            </div>

            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-border bg-surface p-2 shadow-xl sm:left-0 sm:right-0">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary/60">
                  Matching Tools ({searchResults.length})
                </p>
                {searchResults.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                      closeMobileMenu();
                    }}
                    className="flex items-center gap-2.5 rounded-xl p-2 text-xs font-medium text-text-primary no-underline transition hover:bg-red-50"
                  >
                    <tool.icon size={16} className="shrink-0 text-brand" />
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">{tool.title}</p>
                      <p className="truncate text-[10px] text-text-secondary/60">{tool.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition hover:bg-red-50 hover:text-brand lg:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </Toolbar>
      </Container>

      {isMobileMenuOpen && (
        <div className="border-t border-border bg-surface lg:hidden">
          <nav className="mx-auto flex max-h-[min(70vh,28rem)] w-full flex-col overflow-y-auto px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMobileMenu}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-text-primary no-underline transition hover:bg-red-50 hover:text-brand"
              >
                <span>{link.label}</span>
                {"hasDropdown" in link && link.hasDropdown && (
                  <ChevronDown size={16} className="text-text-secondary/50" />
                )}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </AppBar>
  );
}
