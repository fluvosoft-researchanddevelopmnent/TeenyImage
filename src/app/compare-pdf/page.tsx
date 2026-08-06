"use client";
import { getPdfJs } from "@/lib/pdfjs";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import * as Diff from "diff";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";



export default function ComparePdfPage() {
  const [files1, setFiles1] = useState<File[]>([]);
  const [files2, setFiles2] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [diffResult, setDiffResult] = useState<Diff.Change[] | null>(null);

  const extractText = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await getPdfJs();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map((item: any) => item.str).join(" ") + "\\n";
    }
    return text;
  };

  const handleCompare = async () => {
    if (files1.length === 0 || files2.length === 0) return;
    setIsProcessing(true);
    setDiffResult(null);

    try {
      const text1 = await extractText(files1[0]);
      const text2 = await extractText(files2[0]);

      const diff = Diff.diffWords(text1, text2);
      setDiffResult(diff);
      
    } catch (error) {
      console.error("Error comparing PDFs:", error);
      alert("Failed to compare the documents.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Compare PDF"
      description="Show a text comparison and easily spot changes between file versions."
      icon={ArrowLeftRight}
      iconClassName="bg-[#e8f0fe] text-[#3498db]"
    >
      <div className="flex flex-col items-center space-y-8">
        
        <div className="flex w-full flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
                <FileUploader
                files={files1}
                onFilesChange={(newFiles) => setFiles1(newFiles.slice(0, 1))}
                accept={{ "application/pdf": [".pdf"] }}
                title="Original PDF"
                description="Upload the original file"
                maxFiles={1}
                />
            </div>
            <div className="flex-1">
                <FileUploader
                files={files2}
                onFilesChange={(newFiles) => setFiles2(newFiles.slice(0, 1))}
                accept={{ "application/pdf": [".pdf"] }}
                title="Modified PDF"
                description="Upload the new file"
                maxFiles={1}
                />
            </div>
        </div>

        {files1.length > 0 && files2.length > 0 && (
          <Button
            size="large"
            onClick={handleCompare}
            disabled={isProcessing}
            className="w-full max-w-md text-lg px-12 py-6 rounded-full bg-[#3498db] hover:bg-[#2980b9] text-white"
          >
            {isProcessing ? "Comparing..." : "Compare Text"}
          </Button>
        )}

        {diffResult && (
            <div className="w-full max-w-4xl p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="mb-4 text-lg font-semibold border-b pb-2">Comparison Result</h3>
                <div className="prose max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                    {diffResult.map((part, index) => (
                        <span 
                            key={index} 
                            className={part.added ? 'bg-green-100 text-green-800 px-1 rounded' : part.removed ? 'bg-red-100 text-red-800 line-through px-1 rounded' : ''}
                        >
                            {part.value}
                        </span>
                    ))}
                </div>
            </div>
        )}
      </div>
    </ToolLayout>
  );
}
