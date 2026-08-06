"use client";

import { useCallback } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FileUploaderProps extends DropzoneOptions {
  files: File[];
  onFilesChange: (files: File[]) => void;
  title?: string;
  description?: string;
}

export function FileUploader({
  files,
  onFilesChange,
  title = "Choose files",
  description = "or drop files here",
  ...dropzoneProps
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesChange([...files, ...acceptedFiles]);
    },
    [files, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    ...dropzoneProps,
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="w-full">
      {files.length === 0 ? (
        <div
          {...getRootProps()}
          className={`relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
            isDragActive
              ? "border-[#e5322d] bg-[#fde8ea]/50"
              : "border-[#e5e7eb] bg-white hover:border-[#e5322d]/50 hover:bg-[#fafafa]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fde8ea] text-[#e5322d] mb-6">
            <UploadCloud className="h-10 w-10" />
          </div>
          <Button size="large" className="mb-4">
            {title}
          </Button>
          <p className="text-sm text-[#666]">{description}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#333]">
              Selected Files ({files.length})
            </h3>
            <div {...getRootProps()} className="cursor-pointer">
              <input {...getInputProps()} />
              <Button variant="outlined" size="small">
                Add more files
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="group relative flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4 pr-12 transition-colors hover:border-[#e5322d]"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="h-8 w-8 shrink-0 text-[#e5322d]" />
                  <div className="overflow-hidden">
                    <p className="truncate text-sm font-medium text-[#333]">
                      {file.name}
                    </p>
                    <p className="text-xs text-[#666]">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute right-4 rounded-full p-1 text-[#999] opacity-0 transition-opacity hover:bg-white hover:text-[#e5322d] group-hover:opacity-100"
                  title="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
