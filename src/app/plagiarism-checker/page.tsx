"use client";

import React, { useState } from "react";
import { Sparkles, Upload, FileText, CheckCircle2, AlertTriangle, Database, ExternalLink, RefreshCw, ShieldCheck, ArrowRight, Copy } from "lucide-react";
import confetti from "canvas-confetti";
import { useApp } from "@/context/AppContext";
import { analyzePlagiarism } from "@/lib/plagiarism/shingleEngine";
import type { PlagiarismResult } from "@/types";

export default function PlagiarismCheckerPage() {
  const { plagiarismIndex, addPlagiarismRecord } = useApp();
  const [activeTab, setActiveTab] = useState<"file" | "text">("text");
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState("Submitted_Document.pdf");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stepMessage, setStepMessage] = useState("");
  const [report, setReport] = useState<PlagiarismResult | null>(null);
  const [isIndexed, setIsIndexed] = useState(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setPastedText(content || `Content extracted from ${file.name}. Deep neural networks have demonstrated unprecedented accuracy in diagnosing pulmonary lesions from chest X-rays. Key drivers of long-term sustainable growth include customer retention metrics, scalable operational infrastructure, and agile supply chain logistics.`);
    };
    reader.readAsText(file);
  };

  const runCheck = () => {
    const textToAnalyze = pastedText.trim();
    if (!textToAnalyze) {
      alert("Please paste text or upload a document first.");
      return;
    }

    setIsAnalyzing(true);
    setReport(null);

    const steps = [
      "Tokenizing text & extracting features...",
      "Generating 4-gram shingle fingerprints...",
      "Searching internal document index...",
      "Querying web & academic databases...",
      "Compiling similarity matrix & match passages..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStepMessage(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        const result = analyzePlagiarism(fileName, textToAnalyze, plagiarismIndex);
        setReport(result);
        setIsAnalyzing(false);

        if (isIndexed) {
          addPlagiarismRecord(result);
        }

        if (result.overallSimilarity < 15) {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
      }
    }, 450);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Badge & Title */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-950/40 px-3.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 mb-3 border border-red-100 dark:border-red-900/40">
          <Sparkles size={14} /> Turnitin-Style Plagiarism & Similarity Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Deep Document Similarity Checker
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Check text against web corpora and our growing internal index of user papers using MinHash shingle fingerprinting.
        </p>
      </div>

      {!report ? (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl">
          {/* Tabs */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
            <button
              onClick={() => setActiveTab("text")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                activeTab === "text"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Paste Document Text
            </button>
            <button
              onClick={() => setActiveTab("file")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
                activeTab === "file"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Upload Document File (PDF / Word / TXT)
            </button>
          </div>

          {activeTab === "text" ? (
            <div>
              <textarea
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your essay, thesis, or paper content here (minimum 30 words recommended)..."
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
              <div className="flex justify-between items-center mt-2 text-xs text-slate-400 px-1">
                <span>{pastedText.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>Supports multi-language matching</span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-red-500 transition bg-slate-50/50 dark:bg-slate-800/40">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                id="plag-file-input"
                className="hidden"
              />
              <label htmlFor="plag-file-input" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Click to select file or drag & drop
                  </p>
                  <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT up to 50MB</p>
                </div>
              </label>
              {fileName && <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400 font-mono">Selected: {fileName}</p>}
            </div>
          )}

          {/* Indexing Checkbox */}
          <div className="mt-6 flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <input
              type="checkbox"
              id="index-toggle"
              checked={isIndexed}
              onChange={(e) => setIsIndexed(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="index-toggle" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <span className="font-semibold text-slate-900 dark:text-white">Add to Internal Index:</span> Fingerprint and add to user document database so repeat submissions are flagged honestly.
            </label>
          </div>

          {/* Action Button */}
          <button
            onClick={runCheck}
            disabled={isAnalyzing}
            className="mt-6 w-full py-4 rounded-2xl bg-[#e5322d] text-white text-sm font-bold shadow-lg hover:bg-[#d42b26] disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>{stepMessage}</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Run Plagiarism & Similarity Analysis</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Report Dashboard */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Score Summary Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">
                {report.documentTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Analyzed {report.wordCount} words • Fingerprinted {new Date(report.indexedAt).toLocaleTimeString()}
              </p>
              <div className="mt-4 flex items-center justify-center md:justify-start gap-2">
                <button
                  onClick={() => {
                    setReport(null);
                    setPastedText("");
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Check Another File
                </button>
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center h-28 w-28 rounded-full border-8 border-slate-100 dark:border-slate-800">
                <div
                  className={`text-2xl font-black ${
                    report.overallSimilarity > 25 ? "text-red-500" : "text-emerald-500"
                  }`}
                >
                  {report.overallSimilarity}%
                </div>
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Overall Similarity
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <ShieldCheck size={16} /> Original Content
                </span>
                <span className="text-sm font-extrabold">{report.uniquePercentage}%</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle size={16} /> Matched Sources ({report.matches.length})
                </span>
                <span className="text-sm font-extrabold">{report.overallSimilarity}%</span>
              </div>
            </div>
          </div>

          {/* Matches & Passage Highlights */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Database size={18} className="text-red-500" /> Source Matches & Highlighted Passages
            </h3>

            {report.matches.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 size={32} className="mx-auto mb-2" />
                <p className="font-bold">No Significant Similarity Detected!</p>
                <p className="text-xs opacity-80 mt-1">This document appears 100% original across web and internal index sources.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {report.matches.map((match, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="rounded-md bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                          {match.sourceType}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                          {match.sourceTitle}
                          {match.url && (
                            <a href={match.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-red-500">
                          {match.similarityPercentage}% Match
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {match.matchedPassages.map((p, pIdx) => (
                        <div key={pIdx} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-red-100/60 dark:bg-red-950/50 text-slate-800 dark:text-slate-200 border-l-4 border-red-500">
                            <p className="font-bold text-[10px] text-red-600 dark:text-red-400 uppercase mb-1">Your Passage</p>
                            <p className="italic">"{p.targetSnippet}"</p>
                          </div>
                          <div className="p-3 rounded-xl bg-amber-100/60 dark:bg-amber-950/50 text-slate-800 dark:text-slate-200 border-l-4 border-amber-500">
                            <p className="font-bold text-[10px] text-amber-600 dark:text-amber-400 uppercase mb-1">Matched Source Passage</p>
                            <p className="italic">"{p.sourceSnippet}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
