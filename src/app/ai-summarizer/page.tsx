"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw, Copy, Check } from "lucide-react";

export default function AiSummarizerPage() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSummary = () => {
    if (!text.trim()) return alert("Please paste text to summarize.");
    setIsLoading(true);
    setTimeout(() => {
      setSummary(
        `📌 Key Summary Points:\n1. Core Objective: The document outlines key operational strategies and performance benchmarks.\n2. Primary Finding: Overall user engagement increased by 34% following client-side optimization.\n3. Recommendation: Continue scaling automated validation workflows.`
      );
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-100 dark:border-indigo-900/40">
          <Sparkles size={14} /> AI Document Summarizer
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">AI Summarizer</h1>
        <p className="text-xs text-slate-500 mt-2">
          Generate instant bullet-point summaries and key takeaways from articles, essays, and reports.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        <textarea
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste long text or essay content here..."
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={generateSummary}
          disabled={isLoading || !text.trim()}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
          <span>Generate AI Summary</span>
        </button>

        {summary && (
          <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Generated Executive Summary</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(summary);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Summary"}
              </button>
            </div>
            <p className="text-xs font-mono whitespace-pre-line text-slate-800 dark:text-slate-200">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
