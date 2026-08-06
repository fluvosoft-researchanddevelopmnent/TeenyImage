"use client";
import { getPdfJs } from "@/lib/pdfjs";
import { useState, useRef, useEffect } from "react";
import { 
  Pencil, Eraser, Type, ChevronLeft, ChevronRight, Highlighter, Image as ImageIcon,
  RotateCw, ZoomIn, ZoomOut, Trash2, Download, RefreshCw, Undo2, Redo2,
  Square, Circle, ArrowUpRight, Signature, Check, X, FileText, Move
} from "lucide-react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

type ExistingTextItem = {
  id: string;
  page: number;
  originalText: string;
  currentText: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  isSerif: boolean;
  isBold: boolean;
  isItalic: boolean;
  isModified: boolean;
};

function detectFontStyle(fontName: string = "", fontStyleObj: any = {}) {
  const fontStr = (fontName + " " + (fontStyleObj.fontFamily || "")).toLowerCase();
  
  const isSerif = /serif|times|georgia|roman|garamond|minion|cambria|baskerville/i.test(fontStr);
  const isBold = /bold|black|heavy|b\b|medium/i.test(fontStr);
  const isItalic = /italic|oblique|i\b/i.test(fontStr);

  return {
    fontFamily: isSerif ? '"Times New Roman", Times, Georgia, serif' : 'Arial, Helvetica, sans-serif',
    isSerif,
    isBold,
    isItalic,
  };
}

function groupTextItemsIntoLines(rawItems: ExistingTextItem[]): ExistingTextItem[] {
  if (rawItems.length === 0) return [];
  
  const sorted = [...rawItems].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 5) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });

  const lines: ExistingTextItem[] = [];
  let currentLine: ExistingTextItem | null = null;

  sorted.forEach((item) => {
    if (!currentLine) {
      currentLine = { ...item };
    } else {
      const sameLine = Math.abs(currentLine.y - item.y) < 6;
      if (sameLine) {
        const gap = item.x - (currentLine.x + currentLine.width);
        const space = gap > 1 ? " " : "";
        currentLine.originalText += space + item.originalText;
        currentLine.currentText += space + item.currentText;
        currentLine.width = Math.max(currentLine.width, (item.x + item.width) - currentLine.x);
        currentLine.height = Math.max(currentLine.height, item.height);
        currentLine.fontSize = Math.max(currentLine.fontSize, item.fontSize);
        if (item.isBold) currentLine.isBold = true;
      } else {
        lines.push(currentLine);
        currentLine = { ...item };
      }
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

type TextAnnotation = {
  id: number;
  page: number;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
};

type RectAnnotation = {
  id: number;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  type: "whiteout" | "highlight" | "rectangle" | "circle";
};

type FreehandDrawing = {
  id: number;
  page: number;
  points: { x: number; y: number }[];
  color: string;
  size: number;
};

type ImageStamp = {
  id: number;
  page: number;
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function EditPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfPage, setPdfPage] = useState<any>(null);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [deletedPages, setDeletedPages] = useState<number[]>([]);

  // Editor Mode
  const [mode, setMode] = useState<"select" | "text" | "edit-existing" | "whiteout" | "highlight" | "draw" | "shape" | "image">("select");
  const [shapeType, setShapeType] = useState<"rectangle" | "circle">("rectangle");
  const [color, setColor] = useState<string>("#000000");
  const [fontSize, setFontSize] = useState<number>(16);
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // Annotations & Extracted Text
  const [existingTexts, setExistingTexts] = useState<ExistingTextItem[]>([]);
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);
  const [rects, setRects] = useState<RectAnnotation[]>([]);
  const [drawings, setDrawings] = useState<FreehandDrawing[]>([]);
  const [images, setImages] = useState<ImageStamp[]>([]);

  // Signature Modal state
  const [showSigModal, setShowSigModal] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigDrawing, setIsSigDrawing] = useState(false);

  // Undo / Redo stacks
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Interaction Dragging
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentDrag, setCurrentDrag] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [draggedElement, setDraggedElement] = useState<{ type: string; id: number | string; offset: { x: number; y: number } } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 800, height: 1100 });

  // 1. Load PDF Document
  useEffect(() => {
    if (files.length === 0) return;
    
    const loadPdf = async () => {
      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const pdfjsLib = await getPdfJs();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDocProxy(pdf);
        setNumPages(pdf.numPages);
        setCurrentPageNum(1);
        setPageRotations({});
        setDeletedPages([]);
        setAnnotations([]); 
        setRects([]);
        setDrawings([]);
        setImages([]);
        setExistingTexts([]);
      } catch (e) {
        console.error("Failed to load PDF", e);
      }
    };
    loadPdf();
  }, [files]);

  // 2. Load PDF Page & Extract Existing Text Items
  useEffect(() => {
    if (!pdfDocProxy) return;
    
    const loadPageAndText = async () => {
      const page = await pdfDocProxy.getPage(currentPageNum);
      setPdfPage(page);

      // Extract existing PDF text items if not already extracted for this page
      const hasExtracted = existingTexts.some(t => t.page === currentPageNum);
      if (!hasExtracted) {
        try {
          const textContent = await page.getTextContent();
          const baseWidth = 800 * zoomScale;
          const unscaledViewport = page.getViewport({ scale: 1 });
          const scale = baseWidth / unscaledViewport.width;
          const viewport = page.getViewport({ scale });

          const extracted: ExistingTextItem[] = [];
          textContent.items.forEach((item: any, idx: number) => {
            if (!item.str || item.str.trim() === "") return;
            
            // Transform matrix calculation for text placement
            const tx = item.transform;
            const x = tx[4] * scale;
            const pdfY = tx[5];
            const fontHeight = Math.abs(tx[3] || tx[0] || item.height || 12) * scale;
            const fontSize = Math.max(10, Math.round(fontHeight));
            const boxHeight = Math.max(fontSize * 1.3, fontHeight * 1.3);
            const y = Math.max(0, (unscaledViewport.height - pdfY) * scale - fontSize * 0.9);

            const styleObj = textContent.styles?.[item.fontName] || {};
            const fontMeta = detectFontStyle(item.fontName, styleObj);

            extracted.push({
              id: `page-${currentPageNum}-text-${idx}`,
              page: currentPageNum,
              originalText: item.str,
              currentText: item.str,
              x: Math.max(0, x - 2),
              y: Math.max(0, y),
              width: Math.max(30, (item.width || 50) * scale + 8),
              height: Math.round(boxHeight),
              fontSize,
              fontFamily: fontMeta.fontFamily,
              isSerif: fontMeta.isSerif,
              isBold: fontMeta.isBold,
              isItalic: fontMeta.isItalic,
              isModified: false,
            });
          });

          const mergedLines = groupTextItemsIntoLines(extracted);
          setExistingTexts(prev => [...prev, ...mergedLines]);
        } catch (e) {
          console.error("Text extraction failed", e);
        }
      }
    };

    loadPageAndText();
  }, [pdfDocProxy, currentPageNum, zoomScale]);

  // 3. Render Page to Canvas
  useEffect(() => {
    if (!pdfPage || !canvasRef.current) return;

    const renderPage = async () => {
      const canvas = canvasRef.current!;
      const context = canvas.getContext('2d');
      if (!context) return;

      const baseWidth = 800 * zoomScale; 
      const unscaledViewport = pdfPage.getViewport({ scale: 1, rotation: pageRotations[currentPageNum] || 0 });
      const scale = baseWidth / unscaledViewport.width;
      const viewport = pdfPage.getViewport({ scale, rotation: pageRotations[currentPageNum] || 0 });

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      setCanvasSize({ width: Math.round(viewport.width), height: Math.round(viewport.height) });

      await pdfPage.render({ canvasContext: context, viewport }).promise;
    };

    renderPage();
  }, [pdfPage, zoomScale, pageRotations, currentPageNum]);

  // Dragging & Editing Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === "whiteout" || mode === "highlight" || mode === "shape") {
      setIsDragging(true);
      setDragStart({ x, y });
      setCurrentDrag({ x, y });
    } else if (mode === "draw") {
      setIsDragging(true);
      setCurrentPath([{ x, y }]);
    } else if (mode === "text") {
      const newId = Date.now();
      setAnnotations([
        ...annotations, 
        { id: newId, page: currentPageNum, text: "Click to edit", x, y, color, size: fontSize }
      ]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggedElement) {
      const newX = Math.max(0, x - draggedElement.offset.x);
      const newY = Math.max(0, y - draggedElement.offset.y);

      if (draggedElement.type === "annotation") {
        setAnnotations(annotations.map(a => a.id === draggedElement.id ? { ...a, x: newX, y: newY } : a));
      } else if (draggedElement.type === "image") {
        setImages(images.map(img => img.id === draggedElement.id ? { ...img, x: newX, y: newY } : img));
      } else if (draggedElement.type === "rect") {
        setRects(rects.map(r => r.id === draggedElement.id ? { ...r, x: newX, y: newY } : r));
      }
      return;
    }

    if (!isDragging) return;

    if (mode === "whiteout" || mode === "highlight" || mode === "shape") {
      setCurrentDrag({ x, y });
    } else if (mode === "draw") {
      setCurrentPath(prev => [...prev, { x, y }]);
    }
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
    if (!isDragging) return;
    setIsDragging(false);

    if (mode === "whiteout" || mode === "highlight" || mode === "shape") {
      const width = Math.abs(currentDrag.x - dragStart.x);
      const height = Math.abs(currentDrag.y - dragStart.y);
      if (width > 5 && height > 5) {
        const newId = Date.now();
        const x = Math.min(dragStart.x, currentDrag.x);
        const y = Math.min(dragStart.y, currentDrag.y);
        
        let rectType: "whiteout" | "highlight" | "rectangle" | "circle" = "whiteout";
        if (mode === "highlight") rectType = "highlight";
        else if (mode === "shape") rectType = shapeType;

        setRects([...rects, { id: newId, page: currentPageNum, x, y, width, height, color, type: rectType }]);
      }
    } else if (mode === "draw" && currentPath.length > 1) {
      setDrawings([
        ...drawings, 
        { id: Date.now(), page: currentPageNum, points: currentPath, color, size: 3 }
      ]);
      setCurrentPath([]);
    }
  };

  // Image Stamp Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImages([
        ...images,
        { id: Date.now(), page: currentPageNum, dataUrl, x: 100, y: 100, width: 160, height: 100 }
      ]);
    };
    reader.readAsDataURL(file);
  };

  // Signature Modal Canvas Handlers
  const startSigDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsSigDrawing(true);
  };

  const drawSig = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSigDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const saveSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setImages([
      ...images,
      { id: Date.now(), page: currentPageNum, dataUrl, x: 150, y: 150, width: 180, height: 80 }
    ]);
    setShowSigModal(false);
  };

  const clearSignatureCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const hexToRgb = (hex: string) => {
    let cleanHex = hex.replace("#", "");
    if (cleanHex.length === 3) cleanHex = cleanHex.split("").map(c => c + c).join("");
    const num = parseInt(cleanHex, 16);
    return rgb(((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255);
  };

  // 4. Save & Export Modified PDF
  const handleSave = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontTimes = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

      // Remove deleted pages (reverse index order)
      const sortedDeleted = [...deletedPages].sort((a, b) => b - a);
      sortedDeleted.forEach(pNum => {
        if (pdfDoc.getPageCount() > 1) {
          pdfDoc.removePage(pNum - 1);
        }
      });

      const pages = pdfDoc.getPages();
      const baseWidth = 800 * zoomScale;

      let validPageIndex = 0;
      for (let i = 1; i <= numPages; i++) {
        if (deletedPages.includes(i)) continue;
        
        const pdfLibPage = pages[validPageIndex];
        validPageIndex++;

        // Rotate page if requested
        if (pageRotations[i]) {
          pdfLibPage.setRotation(degrees(pageRotations[i]));
        }

        const pageAnns = annotations.filter(a => a.page === i);
        const pageRects = rects.filter(r => r.page === i);
        const pageDrawings = drawings.filter(d => d.page === i);
        const pageImages = images.filter(img => img.page === i);
        const modifiedTexts = existingTexts.filter(t => t.page === i && t.isModified);

        const unscaledViewport = (await pdfDocProxy.getPage(i)).getViewport({ scale: 1 });
        const scale = unscaledViewport.width / baseWidth;
        const pdfHeight = pdfLibPage.getHeight();

        // 4a. Draw Whiteouts over Modified Original PDF Text
        modifiedTexts.forEach(t => {
          const rectY = pdfHeight - (t.y * scale) - (t.height * scale);
          pdfLibPage.drawRectangle({
            x: Math.max(0, t.x * scale - 2),
            y: Math.max(0, rectY - 2),
            width: t.width * scale + 14,
            height: t.height * scale + 6,
            color: rgb(1, 1, 1),
          });

          const chosenFont = t.isSerif
            ? (t.isBold ? fontTimesBold : fontTimes)
            : (t.isBold ? fontHelveticaBold : fontHelvetica);

          const textY = pdfHeight - (t.y * scale) - (t.fontSize * scale * 0.85);

          // Draw Replacement Text on exact original line baseline
          pdfLibPage.drawText(t.currentText, {
            x: t.x * scale,
            y: textY,
            size: t.fontSize * scale,
            font: chosenFont,
            color: rgb(0, 0, 0),
          });
        });

        // 4b. Draw Rectangles & Whiteouts
        pageRects.forEach(r => {
          const rectColor = hexToRgb(r.color || "#000000");
          if (r.type === "whiteout") {
            pdfLibPage.drawRectangle({
              x: r.x * scale,
              y: pdfHeight - (r.y * scale) - (r.height * scale),
              width: r.width * scale,
              height: r.height * scale,
              color: rgb(1, 1, 1),
            });
          } else if (r.type === "highlight") {
            pdfLibPage.drawRectangle({
              x: r.x * scale,
              y: pdfHeight - (r.y * scale) - (r.height * scale),
              width: r.width * scale,
              height: r.height * scale,
              color: rectColor,
              opacity: 0.35,
            });
          } else if (r.type === "rectangle") {
            pdfLibPage.drawRectangle({
              x: r.x * scale,
              y: pdfHeight - (r.y * scale) - (r.height * scale),
              width: r.width * scale,
              height: r.height * scale,
              borderColor: rectColor,
              borderWidth: 2,
            });
          }
        });

        // 4c. Draw Freehand Pencil Lines
        for (const d of pageDrawings) {
          const strokeColor = hexToRgb(d.color);
          for (let p = 0; p < d.points.length - 1; p++) {
            const p1 = d.points[p];
            const p2 = d.points[p + 1];
            pdfLibPage.drawLine({
              start: { x: p1.x * scale, y: pdfHeight - (p1.y * scale) },
              end: { x: p2.x * scale, y: pdfHeight - (p2.y * scale) },
              thickness: d.size * scale,
              color: strokeColor,
            });
          }
        }

        // 4d. Draw Image & Signature Stamps
        for (const imgStamp of pageImages) {
          try {
            const imageBytes = await fetch(imgStamp.dataUrl).then(res => res.arrayBuffer());
            const embeddedImage = imgStamp.dataUrl.startsWith("data:image/png") 
              ? await pdfDoc.embedPng(imageBytes) 
              : await pdfDoc.embedJpg(imageBytes);

            pdfLibPage.drawImage(embeddedImage, {
              x: imgStamp.x * scale,
              y: pdfHeight - (imgStamp.y * scale) - (imgStamp.height * scale),
              width: imgStamp.width * scale,
              height: imgStamp.height * scale,
            });
          } catch (e) {
            console.error("Failed to embed image stamp", e);
          }
        }

        // 4e. Draw New Added Text Annotations
        pageAnns.forEach(ann => {
          const textColor = hexToRgb(ann.color);
          const textSize = ann.size * scale;
          pdfLibPage.drawText(ann.text, {
            x: ann.x * scale,
            y: pdfHeight - (ann.y * scale) - (textSize * 0.8),
            size: textSize,
            font: fontHelvetica,
            color: textColor,
          });
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `edited-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error saving PDF:", error);
      alert("Failed to edit and save the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Professional Real-Time PDF Editor"
      description="Edit existing PDF text directly, add annotations, draw, highlight, place signatures, and manage pages!"
      icon={Pencil}
      iconClassName="bg-[#f3e8ff] text-[#9b59b6]"
    >
      <div className="flex flex-col items-center space-y-4 w-full max-w-[1200px]">
        
        {files.length === 0 ? (
          <FileUploader
            files={files}
            onFilesChange={(newFiles) => setFiles(newFiles.slice(0, 1))}
            accept={{ "application/pdf": [".pdf"] }}
            title="Select PDF file to edit in Real-Time"
            description="or drop PDF here (max 1 file)"
            maxFiles={1}
          />
        ) : (
          <div className="w-full flex flex-col items-center space-y-4">
            
            {/* Top Toolbar */}
            <div className="flex flex-wrap justify-between items-center w-full bg-white p-3 rounded-xl shadow-md border border-gray-200 gap-3">
              
              {/* Tool Options */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <Button 
                  variant={mode === "select" ? "contained" : "outlined"} 
                  onClick={() => setMode("select")}
                  className={mode === "select" ? "bg-purple-600 text-white" : ""}
                  size="small"
                >
                  <Move className="w-4 h-4 mr-1" /> Move & Edit Text
                </Button>

                <Button 
                  variant={mode === "text" ? "contained" : "outlined"} 
                  onClick={() => setMode("text")}
                  className={mode === "text" ? "bg-purple-600 text-white" : ""}
                  size="small"
                >
                  <Type className="w-4 h-4 mr-1" /> Add Text
                </Button>

                <Button 
                  variant={mode === "draw" ? "contained" : "outlined"} 
                  onClick={() => setMode("draw")}
                  className={mode === "draw" ? "bg-purple-600 text-white" : ""}
                  size="small"
                >
                  <Pencil className="w-4 h-4 mr-1" /> Draw
                </Button>

                <Button 
                  variant={mode === "highlight" ? "contained" : "outlined"} 
                  onClick={() => setMode("highlight")}
                  className={mode === "highlight" ? "bg-amber-500 text-white" : ""}
                  size="small"
                >
                  <Highlighter className="w-4 h-4 mr-1" /> Highlight
                </Button>

                <Button 
                  variant={mode === "whiteout" ? "contained" : "outlined"} 
                  onClick={() => setMode("whiteout")}
                  className={mode === "whiteout" ? "bg-red-500 text-white" : ""}
                  size="small"
                >
                  <Eraser className="w-4 h-4 mr-1" /> Whiteout
                </Button>

                <Button 
                  variant={mode === "shape" ? "contained" : "outlined"} 
                  onClick={() => setMode("shape")}
                  className={mode === "shape" ? "bg-purple-600 text-white" : ""}
                  size="small"
                >
                  <Square className="w-4 h-4 mr-1" /> Shapes
                </Button>

                <Button 
                  variant="outlined" 
                  onClick={() => setShowSigModal(true)}
                  size="small"
                >
                  <Signature className="w-4 h-4 mr-1 text-purple-600" /> Sign
                </Button>

                <Button 
                  variant="outlined" 
                  onClick={() => imageInputRef.current?.click()}
                  size="small"
                >
                  <ImageIcon className="w-4 h-4 mr-1" /> Image
                </Button>
                <input 
                  type="file" 
                  ref={imageInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/png, image/jpeg" 
                  className="hidden" 
                />
              </div>

              {/* Style Pickers & Zoom */}
              <div className="flex items-center space-x-3">
                {mode === "shape" && (
                  <div className="flex items-center space-x-1 border-r pr-2 border-gray-200">
                    <button 
                      onClick={() => setShapeType("rectangle")} 
                      className={`p-1 rounded ${shapeType === "rectangle" ? "bg-purple-100 text-purple-700" : ""}`}
                    >
                      <Square className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setShapeType("circle")} 
                      className={`p-1 rounded ${shapeType === "circle" ? "bg-purple-100 text-purple-700" : ""}`}
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {(mode === "text" || mode === "draw" || mode === "highlight" || mode === "shape") && (
                  <div className="flex items-center space-x-1">
                    {["#000000", "#e5322d", "#2563eb", "#16a34a", "#f59e0b"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-5 h-5 rounded-full border transition-transform ${color === c ? "scale-125 ring-2 ring-purple-500" : ""}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}

                {mode === "text" && (
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="border rounded px-1.5 py-1 text-xs bg-white"
                  >
                    <option value={12}>12px</option>
                    <option value={16}>16px</option>
                    <option value={20}>20px</option>
                    <option value={24}>24px</option>
                    <option value={32}>32px</option>
                  </select>
                )}

                <div className="flex items-center space-x-1 border-l pl-2 border-gray-200">
                  <button onClick={() => setZoomScale(Math.max(0.75, zoomScale - 0.25))} className="p-1 hover:bg-gray-100 rounded">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-gray-600 w-9 text-center">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button onClick={() => setZoomScale(Math.min(1.75, zoomScale + 0.25))} className="p-1 hover:bg-gray-100 rounded">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sub Command Bar */}
            <div className="flex justify-between items-center w-full">
              {/* Page Nav */}
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
                  disabled={currentPageNum === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-semibold text-gray-700">
                  Page {currentPageNum} of {numPages}
                </span>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setCurrentPageNum(Math.min(numPages, currentPageNum + 1))}
                  disabled={currentPageNum === numPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Page Rotate & Delete */}
                <button 
                  onClick={() => setPageRotations({ ...pageRotations, [currentPageNum]: ((pageRotations[currentPageNum] || 0) + 90) % 360 })}
                  className="p-1.5 hover:bg-purple-50 rounded border border-gray-200 text-purple-700 ml-2"
                  title="Rotate Page 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                {numPages > 1 && (
                  <button 
                    onClick={() => {
                      setDeletedPages([...deletedPages, currentPageNum]);
                      if (currentPageNum > 1) setCurrentPageNum(currentPageNum - 1);
                    }}
                    className="p-1.5 hover:bg-red-50 rounded border border-red-200 text-red-600"
                    title="Delete Page"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button variant="outlined" size="small" onClick={() => setFiles([])}>
                  <RefreshCw className="w-4 h-4 mr-1" /> Change PDF
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={isProcessing}
                  size="small"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 font-semibold shadow"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  {isProcessing ? "Exporting..." : "Save PDF"}
                </Button>
              </div>
            </div>

            {/* Instruction Tip */}
            <div className="text-xs text-purple-700 font-medium bg-purple-50 px-4 py-1.5 rounded-full border border-purple-100 w-full text-center">
              {mode === "select" && "Click directly on existing PDF text to edit/replace it in real-time, or drag objects around!"}
              {mode === "text" && "Click anywhere on the document canvas to add new text."}
              {mode === "draw" && "Click and drag to draw freehand notes on the document."}
              {mode === "highlight" && "Click and drag to highlight text with transparent color."}
              {mode === "whiteout" && "Click and drag to erase sections with a white box."}
              {mode === "shape" && "Click and drag to place rectangles or circles."}
            </div>

            {/* Editor Workspace */}
            <div className="flex w-full gap-4 items-start justify-center">

              {/* Canvas Area */}
              <div 
                ref={containerRef} 
                className="relative shadow-2xl bg-white overflow-hidden border border-gray-300 rounded-lg select-none" 
                style={{ 
                  width: `${canvasSize.width}px`, 
                  height: `${canvasSize.height}px`, 
                  cursor: mode === "text" ? "text" : mode === "draw" ? "crosshair" : "default" 
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* PDF Background Canvas */}
                <canvas ref={canvasRef} className="absolute top-0 left-0 pointer-events-none" />

                {/* 1. Existing Extracted PDF Text Items (Clean Real-Time Editing) */}
                {existingTexts.filter(t => t.page === currentPageNum).map(t => (
                  <div
                    key={t.id}
                    className="absolute z-20 group"
                    style={{ left: t.x, top: t.y, width: Math.max(t.width, 60), height: t.height }}
                  >
                    <input
                      type="text"
                      value={t.currentText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExistingTexts(existingTexts.map(item => item.id === t.id ? { ...item, currentText: val, isModified: val !== t.originalText } : item));
                      }}
                      placeholder={t.originalText}
                      className={`w-full h-full outline-none transition-all ${
                        t.isModified
                          ? "bg-white text-black border border-gray-300 shadow-sm px-1 py-0.5 z-30"
                          : "bg-transparent text-transparent focus:text-black focus:bg-white focus:border focus:border-purple-500 focus:shadow-md focus:px-1 hover:border hover:border-dashed hover:border-purple-300 hover:bg-purple-50/20"
                      }`}
                      style={{ 
                        fontSize: `${t.fontSize}px`,
                        fontFamily: t.fontFamily,
                        fontWeight: t.isBold ? "bold" : "normal",
                        fontStyle: t.isItalic ? "italic" : "normal",
                        lineHeight: 1.1 
                      }}
                      title="Click to edit this text"
                    />
                  </div>
                ))}

                {/* 2. Freehand Drawings */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                  {drawings.filter(d => d.page === currentPageNum).map(d => (
                    <polyline
                      key={d.id}
                      fill="none"
                      stroke={d.color}
                      strokeWidth={d.size}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={d.points.map(p => `${p.x},${p.y}`).join(" ")}
                    />
                  ))}
                  {isDragging && mode === "draw" && (
                    <polyline
                      fill="none"
                      stroke={color}
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={currentPath.map(p => `${p.x},${p.y}`).join(" ")}
                    />
                  )}
                </svg>

                {/* 3. Rectangles, Highlights, Whiteouts, Shapes */}
                {rects.filter(r => r.page === currentPageNum).map(r => (
                  <div 
                    key={r.id}
                    className={`absolute z-20 group cursor-move ${
                      r.type === "whiteout" ? "bg-white border border-gray-300" :
                      r.type === "highlight" ? "opacity-40" :
                      r.type === "circle" ? "border-2 rounded-full" : "border-2"
                    }`}
                    style={{ 
                      left: r.x, 
                      top: r.y, 
                      width: r.width, 
                      height: r.height,
                      backgroundColor: r.type === "highlight" ? (r.color || "#ffeb3b") : undefined,
                      borderColor: (r.type === "rectangle" || r.type === "circle") ? r.color : undefined
                    }}
                    onMouseDown={(e) => {
                      if (mode === "select") {
                        e.stopPropagation();
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setDraggedElement({
                            type: "rect",
                            id: r.id,
                            offset: { x: e.clientX - rect.left - r.x, y: e.clientY - rect.top - r.y }
                          });
                        }
                      }
                    }}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); setRects(rects.filter(item => item.id !== r.id)); }}
                      className="absolute -top-2.5 -right-2.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-auto"
                    >
                      &times;
                    </button>
                  </div>
                ))}

                {/* Active Drag Box for Whiteout, Highlight, Shape */}
                {isDragging && (mode === "whiteout" || mode === "highlight" || mode === "shape") && (
                  <div 
                    className={`absolute border-2 z-30 pointer-events-none ${
                      mode === "whiteout" ? "border-red-500 bg-white opacity-60" : 
                      mode === "highlight" ? "border-amber-400 bg-yellow-300 opacity-40" : 
                      shapeType === "circle" ? "border-purple-500 rounded-full" : "border-purple-500"
                    }`}
                    style={{
                      left: Math.min(dragStart.x, currentDrag.x),
                      top: Math.min(dragStart.y, currentDrag.y),
                      width: Math.abs(currentDrag.x - dragStart.x),
                      height: Math.abs(currentDrag.y - dragStart.y)
                    }}
                  />
                )}

                {/* 4. Image & Signature Stamps */}
                {images.filter(img => img.page === currentPageNum).map(img => (
                  <div 
                    key={img.id}
                    className="absolute z-25 group border border-dashed border-purple-400 p-0.5 cursor-move"
                    style={{ left: img.x, top: img.y, width: img.width, height: img.height }}
                    onMouseDown={(e) => {
                      if (mode === "select") {
                        e.stopPropagation();
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setDraggedElement({
                            type: "image",
                            id: img.id,
                            offset: { x: e.clientX - rect.left - img.x, y: e.clientY - rect.top - img.y }
                          });
                        }
                      }
                    }}
                  >
                    <img src={img.dataUrl} alt="Stamp" className="w-full h-full object-contain pointer-events-none" />
                    <button 
                      onClick={() => setImages(images.filter(i => i.id !== img.id))}
                      className="absolute -top-2.5 -right-2.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-auto"
                    >
                      &times;
                    </button>
                  </div>
                ))}

                {/* 5. Added Text Annotations */}
                {annotations.filter(a => a.page === currentPageNum).map(ann => (
                  <div 
                    key={ann.id}
                    className="absolute z-40 cursor-move"
                    style={{ left: ann.x, top: ann.y }}
                    onMouseDown={(e) => {
                      if (mode === "select") {
                        e.stopPropagation();
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setDraggedElement({
                            type: "annotation",
                            id: ann.id,
                            offset: { x: e.clientX - rect.left - ann.x, y: e.clientY - rect.top - ann.y }
                          });
                        }
                      }
                    }}
                  >
                    <div className="group relative">
                      <input 
                        autoFocus
                        type="text"
                        value={ann.text}
                        onChange={(e) => setAnnotations(annotations.map(item => item.id === ann.id ? { ...item, text: e.target.value } : item))}
                        className="bg-white/90 border border-purple-400 rounded px-1.5 py-0.5 outline-none font-sans shadow-sm min-w-[60px]"
                        style={{ color: ann.color, fontSize: `${ann.size}px` }}
                      />
                      <button 
                        onClick={() => setAnnotations(annotations.filter(item => item.id !== ann.id))}
                        className="absolute -top-2.5 -right-2.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-auto"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}

              </div>

            </div>
          </div>
        )}

        {/* Signature Popup Modal */}
        {showSigModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-lg flex items-center">
                  <Signature className="w-5 h-5 mr-2 text-purple-600" /> Draw Signature
                </h3>
                <button onClick={() => setShowSigModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <canvas
                  ref={sigCanvasRef}
                  width={400}
                  height={180}
                  className="w-full h-44 cursor-crosshair bg-white"
                  onMouseDown={startSigDraw}
                  onMouseMove={drawSig}
                  onMouseUp={() => setIsSigDrawing(false)}
                  onMouseLeave={() => setIsSigDrawing(false)}
                />
              </div>

              <div className="flex justify-between items-center">
                <Button variant="outlined" size="small" onClick={clearSignatureCanvas}>
                  Clear
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outlined" size="small" onClick={() => setShowSigModal(false)}>
                    Cancel
                  </Button>
                  <Button size="small" onClick={saveSignature} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Check className="w-4 h-4 mr-1" /> Insert Signature
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </ToolLayout>
  );
}
