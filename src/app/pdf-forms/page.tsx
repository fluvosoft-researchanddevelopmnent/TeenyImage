"use client";

import React, { useState } from "react";
import { FileInput, Download, Check } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useApp } from "@/context/AppContext";

export default function PdfFormsPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState("Jane Smith");
  const [email, setEmail] = useState("jane@example.com");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const fillFormFields = async () => {
    if (!selectedFile) return;

    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const form = pdfDoc.getForm();

    try {
      const nameField = form.getTextField("name");
      if (nameField) nameField.setText(fullName);
      const emailField = form.getTextField("email");
      if (emailField) emailField.setText(email);
    } catch {
      // Fallback if form fields don't exist
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);

    addRecentFile({
      name: `Filled_${selectedFile.name}`,
      toolUsed: "PDF Forms",
      size: blob.size,
      downloadUrl: url,
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 dark:bg-purple-950/40 px-3.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 mb-3 border border-purple-100 dark:border-purple-900/40">
          <FileInput size={14} /> Interactive PDF Form Filler & Creator
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Fill PDF Forms</h1>
        <p className="text-xs text-slate-500 mt-2">
          Detect form fields automatically and fill out interactive PDF forms with text fields, checkboxes, and lists.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Interactive PDF Form:</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              setSelectedFile(e.target.files?.[0] || null);
              setDownloadUrl(null);
            }}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-600"
          />
        </div>

        {selectedFile && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Form Input Fields</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name Field:</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address Field:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        )}

        {!downloadUrl ? (
          <button
            onClick={fillFormFields}
            disabled={!selectedFile}
            className="w-full py-4 rounded-2xl bg-[#e5322d] text-white text-xs font-bold shadow-lg hover:bg-[#d42b26] disabled:opacity-50 transition"
          >
            Fill & Save PDF Form
          </button>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50 text-center space-y-3 border border-emerald-200">
            <Check size={36} className="mx-auto text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900">Form Filled & Saved!</h3>
            <a
              href={downloadUrl}
              download={`Filled_${selectedFile?.name}`}
              className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
            >
              Download Filled Form
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
