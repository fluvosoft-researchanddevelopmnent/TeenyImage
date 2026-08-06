"use client";
import { useState } from "react";
import { Unlock } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function UnlockPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState("");

  const handleUnlock = async () => {
    if (files.length === 0 || !password) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      // pdf-lib supports loading encrypted documents if password is provided
      const pdfDoc = await PDFDocument.load(arrayBuffer, { password } as any);
      
      // Saving it without specifying encryption will save it unencrypted
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `unlocked-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error unlocking PDF:", error);
      alert("Failed to unlock the PDF. Ensure the password is correct.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Unlock PDF"
      description="Remove PDF password security."
      icon={Unlock}
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
              placeholder="Enter PDF password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#e5322d] focus:outline-none focus:ring-1 focus:ring-[#e5322d]"
            />
            
            <Button
              size="large"
              onClick={handleUnlock}
              disabled={isProcessing || !password}
              className="w-full text-lg px-12 py-6 rounded-full bg-[#e5322d] hover:bg-[#c0392b] text-white"
            >
              {isProcessing ? "Unlocking..." : "Unlock PDF"}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
