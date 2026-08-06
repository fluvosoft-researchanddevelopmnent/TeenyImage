"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, Cloud, LayoutGrid, Moon, Search, Sun, Sparkles, Lock } from "lucide-react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/layout/Container";
import { NAV_LINKS, PDF_TOOLS } from "@/constants";
import { useApp } from "@/context/AppContext";

export function Header() {
  const { darkMode, toggleDarkMode, searchQuery, setSearchQuery, setIsCloudModalOpen, userTier } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchResults = searchQuery.trim()
    ? PDF_TOOLS.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors"
      color="inherit"
    >
      <Container as="div">
        <Toolbar disableGutters className="min-h-[64px] gap-3 lg:gap-4">
          <Logo />

          <nav className="hidden items-center gap-4 lg:flex xl:gap-5">
            <Link
              href="/plagiarism-checker"
              className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-950/40 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400 no-underline transition hover:bg-red-100"
            >
              <Sparkles size={13} /> Plagiarism Check
            </Link>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex items-center gap-1 text-[13px] font-semibold tracking-wide text-slate-600 dark:text-slate-300 no-underline transition-colors hover:text-slate-900 dark:hover:text-white"
              >
                {link.label}
                {"hasDropdown" in link && link.hasDropdown && (
                  <ChevronDown size={14} strokeWidth={2.5} className="mt-px" />
                )}
              </Link>
            ))}

            <Link
              href="/pricing"
              className="text-[13px] font-semibold tracking-wide text-slate-600 dark:text-slate-300 no-underline transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              Pricing
            </Link>
          </nav>

          {/* In-App File & Tool Search Bar */}
          <div className="relative flex-1 max-w-xs mx-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tools & files..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>

            {/* Search Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-xl max-h-80 overflow-y-auto">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Matching Tools ({searchResults.length})
                </p>
                {searchResults.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-2.5 rounded-xl p-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 no-underline transition"
                  >
                    <tool.icon size={16} className="text-red-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">{tool.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{tool.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Cloud Sync Button */}
            <button
              onClick={() => setIsCloudModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Cloud Sync (Google Drive, Dropbox, OneDrive)"
            >
              <Cloud size={14} className="text-blue-500" />
              <span className="hidden sm:inline">Cloud Sync</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            <Link
              href="/pricing"
              className="hidden text-xs font-semibold text-slate-600 dark:text-slate-300 no-underline transition hover:text-slate-900 sm:inline-block"
            >
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-300 uppercase font-bold">
                {userTier}
              </span>
            </Link>

            <Link
              href="/signup"
              className="rounded-full bg-[#e5322d] px-4 py-1.5 text-xs font-bold text-white no-underline transition hover:bg-[#d42b26] shadow-sm"
            >
              Sign up
            </Link>

            <button
              type="button"
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <LayoutGrid size={18} strokeWidth={2} />
            </button>
          </div>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
