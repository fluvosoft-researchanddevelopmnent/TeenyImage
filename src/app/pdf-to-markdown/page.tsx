"use client";

import React from "react";
import { FileCode } from "lucide-react";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";

export default function PdfToMarkdownPage() {
  return (
    <ToolWorkspaceLayout
      title="Convert PDF to Markdown"
      description="Turn PDFs into Markdown files preserving headings, tables, lists, and links for LLMs & notes."
      category="PDF to Other"
      icon={FileCode}
      actionButtonText="Convert to Markdown"
      onExecute={async (files) => {
        const arrayBuffer = await files[0].arrayBuffer();
        const baseName = files[0].name.replace(/\.pdf$/i, "");

        let mdLines: string[] = [
          `# ${baseName}`,
          "",
          `> Converted from \`${files[0].name}\` by TeenyPDF on ${new Date().toLocaleDateString()}`,
          "",
        ];

        try {
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

          const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;

          for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();

            // Group items by Y position
            const buckets: Map<number, { text: string; fontSize: number }[]> = new Map();
            for (const item of content.items) {
              if (!("str" in item) || !item.str.trim()) continue;
              const transform = (item as { transform: number[]; height: number }).transform;
              const height = (item as { height: number }).height ?? 12;
              const y = Math.round(transform[5] / 6) * 6;
              if (!buckets.has(y)) buckets.set(y, []);
              buckets.get(y)!.push({ text: item.str, fontSize: height });
            }

            const sortedYs = [...buckets.keys()].sort((a, b) => b - a);

            mdLines.push(`## Page ${i}`, "");

            for (const y of sortedYs) {
              const cells = buckets.get(y)!;
              const lineText = cells.map((c) => c.text).join(" ").trim();
              const avgFontSize = cells.reduce((s, c) => s + c.fontSize, 0) / cells.length;

              if (!lineText) continue;

              // Heuristic: large font → heading, medium → subheading, small → body
              if (avgFontSize >= 18) {
                mdLines.push(`### ${lineText}`);
              } else if (avgFontSize >= 14) {
                mdLines.push(`#### ${lineText}`);
              } else if (lineText.startsWith("•") || lineText.startsWith("-") || lineText.startsWith("*")) {
                mdLines.push(`- ${lineText.replace(/^[•\-*]\s*/, "")}`);
              } else {
                mdLines.push(lineText);
              }
            }

            mdLines.push("");
          }
        } catch {
          mdLines.push(
            "<!-- PDF.js extraction failed — the PDF may be image-based or encrypted -->",
            "",
            `File: ${files[0].name}`,
          );
        }

        const mdText = mdLines.join("\n");
        const blob = new Blob([mdText], { type: "text/markdown;charset=utf-8" });
        return {
          blob,
          fileName: `${baseName}.md`,
        };
      }}
    />
  );
}
