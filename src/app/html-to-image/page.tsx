"use client";

import { ConversionPageLayout } from "@/components/common";
import { IMAGE_TOOLS } from "@/constants";

export default function HtmlToImagePage() {
  const tool = IMAGE_TOOLS.find((t) => t.href === "/html-to-image");

  return (
    <ConversionPageLayout
      title={tool!.title}
      description={tool!.description}
      badge={tool!.categories[0]}
      icon={tool!.icon}
      acceptTypes=".jpg,.png,.webp,.gif"
      inputId="html-to-image-upload"
      actionLabel="Coming Soon"
      processingLabel="Processing..."
      selectedFile={null}
      isProcessing={false}
      downloadUrl={null}
      resultName=""
      downloadLabel="Download"
      onFileChange={() => {}}
      onConvert={() => {}}
      onReset={() => {}}
      canConvert={false}
    >
      <p className="text-sm text-text-secondary text-center py-2">
        This tool is under development.
      </p>
    </ConversionPageLayout>
  );
}
