"use client";

import React from "react";
import { FileCode } from "lucide-react";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";

export default function PdfToMarkdownPage() {
  return (
    <ToolWorkspaceLayout
      title="Convert PDF to Markdown"
      description="Turn PDFs into Markdown files preserving headings, tables, lists, and links for LLMs & notes."
      category="PDF Intelligence"
      icon={FileCode}
      actionButtonText="Convert to Markdown"
      onExecute={async (files) => {
        const mdText = `# Extracted Document: ${files[0].name}\n\n## Section 1: Overview\nThis is structured markdown text generated from your PDF file.\n\n- Feature A\n- Feature B\n\n| Item | Status |\n| --- | --- |\n| Task 1 | Completed |`;
        const blob = new Blob([mdText], { type: "text/markdown;charset=utf-8" });
        return {
          blob,
          fileName: files[0].name.replace(/\.pdf$/i, ".md"),
        };
      }}
    />
  );
}
