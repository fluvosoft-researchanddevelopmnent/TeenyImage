"use client";

import React, { useEffect, useRef, useState } from "react";
import { Pencil, AlertTriangle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";
import { PdfEditor } from "@/components/edit-pdf/PdfEditor";

export default function EditPdfPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setDownloadUrl(null);
    setError(null);
    setIsEditing(false);
  };

  const openEditor = () => {
    if (!selectedFile) return;
    setError(null);
    setIsEditing(true);
  };

  const handleSaved = (blob: Blob, fileName: string) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    setDownloadUrl(url);
    setResultName(fileName);
    setIsEditing(false);
    setIsProcessing(false);
    addRecentFile({ name: fileName, toolUsed: "Edit PDF", size: blob.size, downloadUrl: url });
  };

  const reset = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setSelectedFile(null);
    setDownloadUrl(null);
    setError(null);
    setIsEditing(false);
  };

  return (
    <>
      <ConversionPageLayout
        title="Edit PDF"
        description="Add text, images, freehand drawings, highlights, and shapes to a PDF. Move and restyle items, then download your edited file."
        badge="PDF Editor"
        icon={Pencil}
        acceptTypes=".pdf"
        inputId="edit-pdf-input"
        actionLabel="Open PDF Editor"
        processingLabel="Opening editor..."
        selectedFile={selectedFile}
        isProcessing={isProcessing}
        downloadUrl={downloadUrl}
        resultName={resultName}
        downloadLabel="Download Edited PDF"
        onFileChange={handleFileChange}
        onConvert={openEditor}
        onReset={reset}
      >
        {error && (
          <div className="flex items-start gap-2 mt-4 p-3 rounded-xl border border-red-300 bg-red-50 text-brand text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </ConversionPageLayout>

      {isEditing && selectedFile && (
        <PdfEditor
          file={selectedFile}
          onClose={() => setIsEditing(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
