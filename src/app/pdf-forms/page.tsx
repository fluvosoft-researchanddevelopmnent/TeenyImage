"use client";
import { useState } from "react";
import { FileInput } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

type FormField = { name: string; type: string };

export default function PdfFormsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loadedPdfDoc, setLoadedPdfDoc] = useState<PDFDocument | null>(null);

  const handleLoadForm = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setFormFields([]);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setLoadedPdfDoc(pdfDoc);
      
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      const extractedFields = fields.map(f => {
          let type = "Unknown";
          if (f.constructor.name === "PDFTextField") type = "Text";
          if (f.constructor.name === "PDFCheckBox") type = "Checkbox";
          if (f.constructor.name === "PDFDropdown") type = "Dropdown";
          if (f.constructor.name === "PDFRadioGroup") type = "RadioGroup";
          return { name: f.getName(), type };
      });
      
      if (extractedFields.length === 0) {
          alert("No fillable form fields found in this PDF.");
      } else {
          setFormFields(extractedFields);
      }
    } catch (error) {
      console.error("Error loading PDF form:", error);
      alert("Failed to load form fields from the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFillAndDownload = async () => {
      if (!loadedPdfDoc) return;
      setIsProcessing(true);
      try {
          const form = loadedPdfDoc.getForm();
          
          Object.keys(formData).forEach(fieldName => {
             const field = form.getField(fieldName);
             if (field.constructor.name === "PDFTextField") {
                 form.getTextField(fieldName).setText(formData[fieldName]);
             }
             // Support for checkboxes/dropdowns could be added here
          });
          
          const pdfBytes = await loadedPdfDoc.save();
          const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `filled-form.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      } catch (error) {
          console.error("Error saving form:", error);
          alert("Failed to fill and download the PDF form.");
      } finally {
          setIsProcessing(false);
      }
  }

  const handleInputChange = (name: string, value: string) => {
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <ToolLayout
      title="PDF Forms"
      description="Detect form fields and fill them out instantly."
      icon={FileInput}
      iconClassName="bg-[#f3e8ff] text-[#9b59b6]"
    >
      <div className="flex flex-col items-center space-y-8">
        
        {formFields.length === 0 ? (
            <>
                <FileUploader
                files={files}
                onFilesChange={(newFiles) => setFiles(newFiles.slice(0, 1))}
                accept={{ "application/pdf": [".pdf"] }}
                title="Select PDF Form"
                description="Upload a fillable PDF form"
                maxFiles={1}
                />

                {files.length > 0 && (
                <Button
                    size="large"
                    onClick={handleLoadForm}
                    disabled={isProcessing}
                    className="w-full max-w-md sm:w-auto text-lg px-12 py-6 rounded-full bg-[#9b59b6] hover:bg-[#8e44ad] text-white"
                >
                    {isProcessing ? "Loading Form..." : "Load Form Fields"}
                </Button>
                )}
            </>
        ) : (
            <div className="w-full max-w-2xl bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-semibold mb-6 pb-2 border-b">Fill PDF Form</h3>
                <div className="space-y-4">
                    {formFields.map(field => (
                        <div key={field.name} className="flex flex-col space-y-1">
                            <label className="text-sm font-medium text-gray-700">{field.name} ({field.type})</label>
                            {field.type === "Text" ? (
                                <input 
                                    type="text" 
                                    className="border rounded p-2 focus:ring-1 focus:ring-[#9b59b6] outline-none"
                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                    value={formData[field.name] || ""}
                                />
                            ) : (
                                <p className="text-sm text-gray-400 italic">Basic text filling supported in this demo.</p>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-8 flex space-x-4">
                    <Button variant="outlined" onClick={() => setFormFields([])} className="flex-1 py-6">Cancel</Button>
                    <Button onClick={handleFillAndDownload} disabled={isProcessing} className="flex-1 py-6 bg-[#9b59b6] hover:bg-[#8e44ad] text-white">
                        {isProcessing ? "Saving..." : "Fill and Download PDF"}
                    </Button>
                </div>
            </div>
        )}
      </div>
    </ToolLayout>
  );
}
