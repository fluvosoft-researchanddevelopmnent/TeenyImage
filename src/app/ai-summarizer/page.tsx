"use client";
import { getPdfJs } from "@/lib/pdfjs";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";



export default function AiSummarizerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [summary, setSummary] = useState("");

  const handleSummarize = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setSummary("");

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      
      const pdfjsLib = await getPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          text += textContent.items.map((item: any) => item.str).join(" ") + " ";
      }

      if (!text.trim()) {
        throw new Error("No readable text found in the PDF document.");
      }

      // Real extractive text summarizer algorithm
      const sentences = text
        .split(/(?<=[.?!])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 20);

      if (sentences.length === 0) {
        setSummary(`Document Text Overview:\n\n${text.substring(0, 500)}...`);
        return;
      }

      // Word frequency matrix
      const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
      const freq: Record<string, number> = {};
      words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

      // Score sentences based on key frequency terms
      const scored = sentences.map(sentence => {
        const sWords = sentence.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
        const score = sWords.reduce((acc, w) => acc + (freq[w] || 0), 0) / (sWords.length || 1);
        return { sentence, score };
      });

      // Top sentences by score
      const topSentences = [...scored]
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(5, Math.ceil(sentences.length * 0.3)))
        .map(item => `• ${item.sentence}`);

      const generatedSummary = `Summary of "${file.name}" (${pdf.numPages} Pages):\n\nKey Insights:\n${topSentences.join("\n\n")}\n\nDocument Word Count: ${words.length} words.`;
      setSummary(generatedSummary);
    } catch (error: any) {
      console.error("Error summarizing PDF:", error);
      alert(`Failed to summarize the document. ${error.message || ""}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="AI Summarizer"
      description="Quickly generate concise summaries from articles, paragraphs, and essays."
      icon={Sparkles}
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
          <div className="w-full max-w-2xl space-y-4">


              <Button
                size="large"
                onClick={handleSummarize}
                disabled={isProcessing}
                className="w-full text-lg px-12 py-6 rounded-full bg-[#3498db] hover:bg-[#2980b9] text-white"
              >
                {isProcessing ? "Summarizing..." : "Generate Summary"}
              </Button>
          </div>
        )}

        {summary && (
            <div className="w-full max-w-3xl p-6 bg-white border border-gray-200 rounded-lg shadow-sm mt-8">
                <h3 className="mb-4 text-xl font-semibold border-b pb-2 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-[#3498db]" />
                    Summary Result
                </h3>
                <div className="prose max-w-none whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {summary}
                </div>
            </div>
        )}

      </div>
    </ToolLayout>
  );
}
