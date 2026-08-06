"use client";
import { useState, useRef, useEffect } from "react";
import { Scan } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/Button";

export default function ScanToPdfPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access the camera. Please ensure you have granted permission.");
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setImages((prev) => [...prev, dataUrl]);
      }
    }
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const imageDataUrl of images) {
        const imageBytes = await fetch(imageDataUrl).then((res) => res.arrayBuffer());
        const image = await pdfDoc.embedJpg(imageBytes);
        
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scanned-document.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating scanned PDF:", error);
      alert("Failed to create the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Scan to PDF"
      description="Capture document scans from your device's camera."
      icon={Scan}
      iconClassName="bg-[#e8f0fe] text-[#3498db]"
    >
      <div className="flex flex-col items-center space-y-8">
        
        {!stream && (
            <Button
              size="large"
              onClick={startCamera}
              className="text-lg px-12 py-6 rounded-full bg-[#3498db] hover:bg-[#2980b9] text-white"
            >
              Start Camera
            </Button>
        )}

        {stream && (
            <div className="flex flex-col items-center space-y-4 w-full max-w-md">
                <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-[3/4]">
                   <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="flex space-x-4 w-full">
                    <Button onClick={captureImage} className="flex-1 py-4 text-lg bg-gray-800 hover:bg-gray-700 text-white">
                        Capture Page
                    </Button>
                </div>
            </div>
        )}

        {images.length > 0 && (
            <div className="w-full max-w-2xl space-y-4">
                <h3 className="font-semibold text-lg">Captured Pages ({images.length})</h3>
                <div className="grid grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-[3/4] border rounded overflow-hidden">
                            <img src={img} alt={`Scanned page ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>

                <Button
                    size="large"
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="w-full text-lg px-12 py-6 mt-8 rounded-full bg-[#3498db] hover:bg-[#2980b9] text-white"
                >
                    {isProcessing ? "Creating PDF..." : "Save as PDF"}
                </Button>
            </div>
        )}

      </div>
    </ToolLayout>
  );
}
