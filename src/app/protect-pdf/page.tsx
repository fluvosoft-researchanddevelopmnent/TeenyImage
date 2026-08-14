"use client";
import { useState } from "react";
import { Lock } from "lucide-react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function ProtectPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState("");

  const handleProtect = async () => {
    if (files.length === 0 || !password) return;
    setIsProcessing(true);

    try {
      // NOTE: Pure client-side PDF encryption is not natively supported by pdf-lib.
      // A full implementation requires a backend or a heavy WASM module (like qpdf).
      // For this demo, we mock the process to show the UI.
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Note: True client-side PDF encryption requires a heavy WASM module or backend server. This is a UI demonstration.");
      
    } catch (error) {
      console.error("Error protecting PDF:", error);
      alert("Failed to protect the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Protect PDF"
      description="Encrypt your PDF files with a password."
      icon={Lock}
      iconClassName="bg-[#fde8ea] text-[#e5322d]"
    >
      <div className="flex flex-col items-center space-y-8">
        <FileUploader
          files={files}
          onFilesChange={(newFiles) => setFiles(newFiles.slice(0, 1))}
          accept={{ "application/pdf": [".pdf"] }}
          title="Select PDF file"
          description="or drop PDF here (max 1 file)"
          maxFiles={1}
        />

        {files.length > 0 && (
          <div className="w-full max-w-md space-y-4">
            <input
              type="password"
              placeholder="Enter new password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#e5322d] focus:outline-none focus:ring-1 focus:ring-[#e5322d]"
            />
            
            <Button
              size="large"
              onClick={handleProtect}
              disabled={isProcessing || !password}
              className="w-full text-lg px-12 py-6 rounded-full bg-[#e5322d] hover:bg-[#c0392b] text-white"
            >
              {isProcessing ? "Protecting..." : "Protect PDF"}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
