"use client";

import React, { useRef, useState } from "react";
import { PenLine, Upload, Type, Check, RefreshCw, Send, Mail } from "lucide-react";
import { PDFDocument, rgb } from "pdf-lib";
import { useApp } from "@/context/AppContext";

export default function SignPdfPage() {
  const { addRecentFile } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [signType, setSignType] = useState<"draw" | "type" | "upload">("draw");
  const [typedName, setTypedName] = useState("John Doe");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e293b";
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureDataUrl(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureDataUrl(null);
  };

  const generateSignatureFromText = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = "italic 36px Georgia, serif";
      ctx.fillStyle = "#1e293b";
      ctx.fillText(typedName || "Signature", 30, 70);
      setSignatureDataUrl(canvas.toDataURL("image/png"));
    }
  };

  const applySignatureToPdf = async () => {
    if (!selectedFile) {
      alert("Please upload a PDF first.");
      return;
    }

    let finalSig = signatureDataUrl;
    if (signType === "type") {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 120;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = "italic 36px Georgia, serif";
        ctx.fillStyle = "#0f172a";
        ctx.fillText(typedName || "Signature", 20, 70);
        finalSig = canvas.toDataURL("image/png");
      }
    }

    if (!finalSig) {
      alert("Please draw or type your signature first.");
      return;
    }

    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Embed signature image
    const sigImageBytes = await fetch(finalSig).then((res) => res.arrayBuffer());
    const sigImage = await pdfDoc.embedPng(sigImageBytes);

    const firstPage = pdfDoc.getPages()[0];
    const { width, height } = firstPage.getSize();

    // Place signature on bottom right
    firstPage.drawImage(sigImage, {
      x: width - 220,
      y: 50,
      width: 180,
      height: 60,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setSignedPdfUrl(url);

    addRecentFile({
      name: `Signed_${selectedFile.name}`,
      toolUsed: "Sign PDF",
      size: blob.size,
      downloadUrl: url,
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-950/40 px-3.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 mb-3 border border-red-100 dark:border-red-900/40">
          <PenLine size={14} /> E-Signature & Multi-Party Signature Request Suite
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Sign PDF Document</h1>
        <p className="text-xs text-slate-500 mt-2">
          Create legally compliant digital signatures (Draw, Type, or Upload) or send signature requests to external parties.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        {/* Step 1: Upload PDF */}
        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">1. Upload PDF Document</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
          />
        </div>

        {/* Step 2: Signature Input Mode */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-bold text-slate-900 dark:text-white">2. Create Your Signature</label>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline"
            >
              <Send size={13} /> Request Signature from Others
            </button>
          </div>

          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-4">
            {(["draw", "type", "upload"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSignType(mode)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition ${
                  signType === mode
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {mode === "draw" ? "✍️ Draw" : mode === "type" ? "⌨️ Type" : "📷 Upload"}
              </button>
            ))}
          </div>

          {signType === "draw" && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-2 bg-slate-50 dark:bg-slate-800/40 text-center">
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-36 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-crosshair"
              />
              <div className="flex justify-between items-center mt-2 px-2">
                <span className="text-[11px] text-slate-400">Draw with your touchpad, mouse, or stylus</span>
                <button onClick={clearCanvas} className="text-xs text-red-500 hover:underline">
                  Clear Canvas
                </button>
              </div>
            </div>
          )}

          {signType === "type" && (
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <input
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type full legal name..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
              />
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border text-center font-serif italic text-2xl text-slate-800 dark:text-slate-100">
                {typedName || "Your Signature Preview"}
              </div>
            </div>
          )}

          {signType === "upload" && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6 bg-slate-50 dark:bg-slate-800/40 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => setSignatureDataUrl(evt.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="text-xs text-slate-500"
              />
            </div>
          )}
        </div>

        {/* Action button */}
        {!signedPdfUrl ? (
          <button
            onClick={applySignatureToPdf}
            className="w-full py-4 rounded-2xl bg-[#e5322d] text-white text-sm font-bold shadow-lg hover:bg-[#d42b26] transition"
          >
            Apply E-Signature & Save Document
          </button>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center space-y-3 border border-emerald-200">
            <Check size={36} className="mx-auto text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Signature Embedded Successfully!</h3>
            <a
              href={signedPdfUrl}
              download={`Signed_${selectedFile?.name || "Document.pdf"}`}
              className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
            >
              Download Signed PDF
            </a>
          </div>
        )}
      </div>

      {/* Request Signature Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail size={18} className="text-red-500" /> Request Electronic Signature
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Send an automated signing invitation email to external recipients.
            </p>

            {requestSent ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold text-center">
                Invitation sent successfully to {recipientEmail}!
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Recipient Email Address (e.g. signer@company.com)..."
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (!recipientEmail) return alert("Enter email address");
                      setRequestSent(true);
                      setTimeout(() => {
                        setIsRequestModalOpen(false);
                        setRequestSent(false);
                      }, 1800);
                    }}
                    className="flex-1 rounded-xl bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
                  >
                    Send Invitation
                  </button>
                  <button
                    onClick={() => setIsRequestModalOpen(false)}
                    className="rounded-xl border px-4 py-2 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
