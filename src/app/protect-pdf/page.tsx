"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, Upload, Download, Check, Eye, EyeOff, RefreshCw, AlertCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

// TeenyPDF uses AES-256 encryption via the Web Crypto API to wrap the PDF bytes,
// then saves a protected container. On open the user enters the password to decrypt.
async function encryptPdfBytes(pdfBytes: Uint8Array, password: string): Promise<Blob> {
  const enc = new TextEncoder();
  const encoded = enc.encode(password);
  const keyBuffer = encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer;
  const passwordKey = await crypto.subtle.importKey("raw", keyBuffer, "PBKDF2", false, ["deriveKey"]);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const aesKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const cleanBuffer: ArrayBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
  const encryptedData = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, cleanBuffer);

  // Build a custom binary container: [magic(8)] [salt(16)] [iv(12)] [data]
  const magic = new TextEncoder().encode("TPDF001\n"); // 8 bytes marker
  const output = new Uint8Array(magic.length + salt.length + iv.length + encryptedData.byteLength);
  let offset = 0;
  output.set(magic, offset); offset += magic.length;
  output.set(salt, offset); offset += salt.length;
  output.set(iv, offset); offset += iv.length;
  output.set(new Uint8Array(encryptedData), offset);

  // We save this as a .pdf.enc file; for a more user-friendly approach we embed it
  // into a PDF wrapper that shows a password-entry form using JavaScript (PDF JS actions).
  // However, standard PDF AES-256 encryption (PDF spec §7.6) requires building the
  // encryption dictionary at the lowest level. Since pdf-lib does not support this,
  // we deliver the encrypted binary wrapped in a download so the file cannot be opened
  // without TeenyPDF's decrypt tool.
  return new Blob([output.buffer], { type: "application/octet-stream" });
}

export default function ProtectPdfPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [strength, setStrength] = useState(0);

  const checkStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    setStrength(s);
  };

  const protect = async () => {
    if (!selectedFile) return;
    if (!password) { setError("Password cannot be empty."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 4) { setError("Password must be at least 4 characters."); return; }

    setError(null);
    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const blob = await encryptPdfBytes(pdfBytes, password);

      const outName = `Protected_${selectedFile.name}.enc`;
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setResultName(outName);

      addRecentFile({ name: outName, toolUsed: "Protect PDF", size: blob.size, downloadUrl: url });
    } catch (err) {
      console.error("Encryption error:", err);
      setError("Encryption failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const strengthLabels = ["", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = ["", "bg-red-500", "bg-orange-400", "bg-yellow-500", "bg-emerald-500"];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-950/40 px-3.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 mb-3 border border-red-100 dark:border-red-900/40">
          <Lock size={14} /> AES-256 PDF Encryption
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Protect PDF with Password</h1>
        <p className="text-xs text-slate-500 mt-2">
          Encrypts your PDF using AES-256-GCM via the Web Crypto API. The encrypted file can only be opened using the correct password.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        {/* File Upload */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-red-500 transition">
          <input type="file" accept=".pdf" onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setDownloadUrl(null); setError(null); }}
            id="protect-pdf-input" className="hidden" />
          <label htmlFor="protect-pdf-input" className="cursor-pointer flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <Upload size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {selectedFile ? selectedFile.name : "Click to select PDF file"}
            </p>
          </label>
        </div>

        {/* Password Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Set Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); checkStrength(e.target.value); setError(null); }}
                placeholder="Enter a secure password..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 pr-10 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 rounded-full transition-all ${strength >= i ? strengthColors[strength] : "bg-slate-200 dark:bg-slate-700"}`} />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-500">{strengthLabels[strength]}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <input
              type={showPw ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
              placeholder="Confirm password..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-xs text-red-700 dark:text-red-400">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-4 py-3 text-xs text-blue-700 dark:text-blue-400">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <p>Encryption is performed entirely in your browser using AES-256-GCM (Web Crypto API). The encrypted <code>.enc</code> file cannot be opened without the correct password.</p>
        </div>

        {/* Encrypt button */}
        {!downloadUrl ? (
          <button
            onClick={protect}
            disabled={!selectedFile || !password || isProcessing}
            className="w-full py-4 rounded-2xl bg-[#e5322d] text-white text-sm font-bold shadow-lg hover:bg-[#d42b26] disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <><RefreshCw size={18} className="animate-spin" /> Encrypting with AES-256...</>
            ) : (
              <><Lock size={18} /> Encrypt & Protect PDF</>
            )}
          </button>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center border border-emerald-200 dark:border-emerald-800 space-y-3">
            <ShieldCheck size={36} className="mx-auto text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">PDF Encrypted Successfully!</h3>
            <p className="text-xs text-slate-500">
              Your file is protected with AES-256-GCM. Keep your password safe — there is no recovery.
            </p>
            <div className="flex justify-center gap-3">
              <a href={downloadUrl} download={resultName}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition">
                <Download size={15} /> Download Encrypted File
              </a>
              <button onClick={() => { setSelectedFile(null); setDownloadUrl(null); setPassword(""); setConfirmPassword(""); }}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                Encrypt Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
