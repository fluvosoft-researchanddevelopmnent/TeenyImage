"use client";
import { getPdfJs } from "@/lib/pdfjs";

import { useState } from "react";
import { Languages } from "lucide-react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";



export default function TranslatePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [targetLang, setTargetLang] = useState("Spanish");
  const [translation, setTranslation] = useState("");

  const handleTranslate = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setTranslation("");

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      
      const pdfjsLib = await getPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          text += textContent.items.map((item: any) => item.str).join(" ") + "\\n";
      }

      if (!text.trim()) {
        throw new Error("No readable text found in the PDF document.");
      }

      const langMap: Record<string, string> = {
        Spanish: "es",
        French: "fr",
        German: "de",
        Chinese: "zh",
        Japanese: "ja",
        Bengali: "bn",
      };
      const langCode = langMap[targetLang] || "es";
      const sampleText = text.trim().substring(0, 500);

      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(sampleText)}&langpair=autodetect|${langCode}`);
      const data = await res.json();
      const translatedText = data?.responseData?.translatedText || sampleText;

      setTranslation(`Translated to ${targetLang}:\n\n${translatedText}\n\n--- Full Extracted PDF Text (${pdf.numPages} Pages) ---\n${text}`);
    } catch (error: any) {
      console.error("Error translating PDF:", error);
      alert(`Failed to translate document text. ${error.message || ""}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Translate PDF"
      description="Easily translate PDF files powered by AI."
      icon={Languages}
      iconClassName="bg-[#e8f0fe] text-[#3498db]"
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
          <div className="w-full max-w-2xl space-y-6">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Target Language</label>
                    <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3498db] outline-none bg-white"
                    >
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Bengali">Bengali</option>
                    </select>
                  </div>
                  </div>

              <Button
                size="large"
                onClick={handleTranslate}
                disabled={isProcessing}
                className="w-full text-lg px-12 py-6 rounded-full bg-[#3498db] hover:bg-[#2980b9] text-white"
              >
                {isProcessing ? "Translating..." : "Translate Document"}
              </Button>
          </div>
        )}

        {translation && (
            <div className="w-full max-w-3xl p-6 bg-white border border-gray-200 rounded-lg shadow-sm mt-8">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-xl font-semibold flex items-center">
                        <Languages className="w-5 h-5 mr-2 text-[#3498db]" />
                        Translation Result
                    </h3>
                    <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => {
                            const blob = new Blob([translation as any], { type: "text/plain" });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = `translated.txt`;
                            link.click();
                        }}
                    >
                        Download Text
                    </Button>
                </div>
                <div className="prose max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {translation}
                </div>
            </div>
        )}

      </div>
    </ToolLayout>
  );
}
