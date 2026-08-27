"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, LayoutGrid } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";
import { OrganizePdfEditor } from "@/components/organize-pdf/OrganizePdfEditor";

export default function OrganizePdfPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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
    addRecentFile({
      name: fileName,
      toolUsed: "Organize PDF",
      size: blob.size,
      downloadUrl: url,
    });
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
        title="Organize PDF"
        description="Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at your convenience."
        badge="PDF Organizer"
        icon={LayoutGrid}
        acceptTypes=".pdf"
        inputId="organize-pdf-input"
        actionLabel="Organize PDF"
        processingLabel="Opening organizer…"
        selectedFile={selectedFile}
        isProcessing={false}
        downloadUrl={downloadUrl}
        resultName={resultName}
        downloadLabel="Download Organized PDF"
        onFileChange={handleFileChange}
        onConvert={openEditor}
        onReset={reset}
      >
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-brand">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </ConversionPageLayout>

      {isEditing && selectedFile && (
        <OrganizePdfEditor
          file={selectedFile}
          onClose={() => setIsEditing(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
