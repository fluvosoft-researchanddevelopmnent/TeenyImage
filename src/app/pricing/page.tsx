"use client";

import React from "react";
import { Check, ShieldCheck, Sparkles, Zap, Award } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { SubscriptionTier } from "@/types";

export default function PricingPage() {
  const { userTier, setUserTier } = useApp();

  const handleSelectTier = (tier: SubscriptionTier) => {
    setUserTier(tier);
    alert(`Subscribed to ${tier.toUpperCase()} tier! Thank you.`);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-950/40 px-3.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 mb-3 border border-red-100 dark:border-red-900/40">
          <ShieldCheck size={14} /> Transparent & Fair Billing Guarantee
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Simple, Honest Pricing For Everyone
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Free users can always edit, finish, and save their work without hidden paywalls at export time.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        {/* Free Tier */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Free Tier</span>
            <div className="mt-2 flex items-baseline">
              <span className="text-4xl font-black text-slate-900 dark:text-white">৳0</span>
              <span className="text-xs text-slate-500 ml-1">/ forever</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Unlimited operations & exports with daily basic caps.</p>

            <ul className="mt-6 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> All Core PDF Tools
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> 100% Free Saves & Downloads
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> Unlimited Merge, Split, Compress
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span>✕</span> No Plagiarism Checks
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectTier("free")}
            className={`mt-6 w-full py-3 rounded-xl text-xs font-bold transition ${
              userTier === "free"
                ? "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white"
                : "border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {userTier === "free" ? "Current Active Plan" : "Switch to Free"}
          </button>
        </div>

        {/* Pro Tier */}
        <div className="rounded-3xl border-2 border-red-500 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow">
            Most Popular
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">Pro Professional</span>
            <div className="mt-2 flex items-baseline">
              <span className="text-4xl font-black text-slate-900 dark:text-white">৳490</span>
              <span className="text-xs text-slate-500 ml-1">/ month</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Unlimited batch operations, no ads, high file limits.</p>

            <ul className="mt-6 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> Everything in Free
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> Unlimited Batch Processing
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> Full OCR Document Engine
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> Electronic Signature Requests
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectTier("pro")}
            className="mt-6 w-full py-3 rounded-xl bg-[#e5322d] text-white text-xs font-bold shadow hover:bg-[#d42b26] transition"
          >
            {userTier === "pro" ? "Current Active Plan" : "Upgrade to Pro"}
          </button>
        </div>

        {/* Pro + Plagiarism */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Pro + Plagiarism</span>
            <div className="mt-2 flex items-baseline">
              <span className="text-4xl font-black text-slate-900 dark:text-white">৳990</span>
              <span className="text-xs text-slate-500 ml-1">/ month</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Complete toolkit + monthly plagiarism detection quota.</p>

            <ul className="mt-6 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> Everything in Pro
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> 50 Plagiarism Checks / Month
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> Side-by-Side Match Highlights
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> Internal Paper Corpus Indexing
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSelectTier("pro_plagiarism")}
            className="mt-6 w-full py-3 rounded-xl bg-purple-600 text-white text-xs font-bold shadow hover:bg-purple-700 transition"
          >
            Get Pro + Plagiarism
          </button>
        </div>

        {/* Pay-Per-Check Option */}
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Pay-Per-Check</span>
            <div className="mt-2 flex items-baseline">
              <span className="text-4xl font-black text-slate-900 dark:text-white">৳99</span>
              <span className="text-xs text-slate-500 ml-1">/ check</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">One-off single plagiarism check with no subscription commitment.</p>

            <ul className="mt-6 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> Single Document Analysis
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> No Monthly Subscription
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-500" /> Full Match Report Download
              </li>
            </ul>
          </div>

          <button
            onClick={() => alert("Purchased 1 Single Plagiarism Check!")}
            className="mt-6 w-full py-3 rounded-xl border border-slate-400 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Buy Single Check (৳99)
          </button>
        </div>
      </div>
    </div>
  );
}
