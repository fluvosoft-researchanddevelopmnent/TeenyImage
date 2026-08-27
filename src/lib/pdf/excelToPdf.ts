/**
 * Excel / CSV → PDF with real table layout via jspdf-autotable.
 */

import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import * as XLSX from "xlsx";

export type ExcelToPdfResult = {
  blob: Blob;
  warnings: string[];
};

function cellToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toLocaleString();
  return String(value);
}

/** Normalize sheet rows into a rectangular string matrix. */
function sheetToMatrix(sheet: XLSX.WorkSheet): string[][] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
    raw: false,
  });

  if (!Array.isArray(rows) || rows.length === 0) return [];

  let maxCols = 0;
  const normalized = rows.map((row) => {
    const cells = Array.isArray(row) ? row.map(cellToString) : [cellToString(row)];
    maxCols = Math.max(maxCols, cells.length);
    return cells;
  });

  return normalized.map((row) => {
    if (row.length >= maxCols) return row;
    return [...row, ...Array(maxCols - row.length).fill("")];
  });
}

/** Drop trailing fully-empty columns/rows so the PDF isn't sparse. */
function trimMatrix(matrix: string[][]): string[][] {
  if (matrix.length === 0) return matrix;

  let lastRow = matrix.length - 1;
  while (lastRow >= 0 && matrix[lastRow].every((c) => !c.trim())) lastRow--;
  if (lastRow < 0) return [];

  let lastCol = matrix[0].length - 1;
  while (lastCol >= 0 && matrix.slice(0, lastRow + 1).every((r) => !String(r[lastCol] ?? "").trim())) {
    lastCol--;
  }
  if (lastCol < 0) return [];

  return matrix.slice(0, lastRow + 1).map((row) => row.slice(0, lastCol + 1));
}

function guessHasHeader(matrix: string[][]): boolean {
  if (matrix.length < 2) return false;
  const first = matrix[0];
  const second = matrix[1];
  // Header-like if first row is mostly non-empty text and second row differs in "shape"
  const firstFilled = first.filter((c) => c.trim()).length;
  if (firstFilled < Math.ceil(first.length * 0.5)) return false;
  const firstAllText = first.every((c) => !c.trim() || Number.isNaN(Number(c.replace(/[,%$]/g, ""))));
  const secondHasNumbers = second.some((c) => c.trim() && !Number.isNaN(Number(c.replace(/[,%$]/g, ""))));
  return firstAllText || secondHasNumbers;
}

function chooseOrientation(colCount: number): "portrait" | "landscape" {
  return colCount > 7 ? "landscape" : "portrait";
}

function buildPdfFromWorkbook(wb: XLSX.WorkBook, sourceName: string): ExcelToPdfResult {
  const warnings: string[] = [];
  const sheetNames = wb.SheetNames.filter(Boolean);

  if (sheetNames.length === 0) {
    const pdf = new jsPDF();
    pdf.setFontSize(12);
    pdf.text("No sheets found in this workbook.", 20, 30);
    return { blob: pdf.output("blob"), warnings: ["Workbook contained no sheets."] };
  }

  let pdf: jsPDF | null = null;
  let sheetsRendered = 0;

  for (let i = 0; i < sheetNames.length; i++) {
    const name = sheetNames[i];
    const sheet = wb.Sheets[name];
    if (!sheet) continue;

    const matrix = trimMatrix(sheetToMatrix(sheet));
    if (matrix.length === 0) {
      warnings.push(`Sheet "${name}" was empty and was skipped.`);
      continue;
    }

    const colCount = matrix[0].length;
    const orientation = chooseOrientation(colCount);
    const hasHeader = guessHasHeader(matrix);
    const head = hasHeader ? [matrix[0]] : undefined;
    const body = hasHeader ? matrix.slice(1) : matrix;

    if (!pdf) {
      pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
    } else {
      pdf.addPage("a4", orientation);
    }

    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 12;

    // Sheet title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(30);
    pdf.text(name, margin, 14);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(120);
    pdf.text(
      `${sourceName}  ·  ${matrix.length} row(s) × ${colCount} col(s)`,
      margin,
      20
    );
    pdf.setTextColor(0);

    autoTable(pdf, {
      startY: 24,
      head,
      body,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: colCount > 10 ? 7 : colCount > 7 ? 8 : 9,
        cellPadding: 1.6,
        overflow: "linebreak",
        valign: "middle",
        lineColor: [200, 200, 200],
        lineWidth: 0.2,
        textColor: [20, 20, 20],
      },
      headStyles: {
        fillColor: [185, 28, 28],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      margin: { top: 24, right: margin, bottom: margin, left: margin },
      tableWidth: "auto",
      horizontalPageBreak: true,
      horizontalPageBreakRepeat: hasHeader ? 0 : undefined,
      didDrawPage: (data) => {
        // Footer page number
        const pageSize = pdf!.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        const pageWidth = pageSize.getWidth();
        pdf!.setFontSize(8);
        pdf!.setTextColor(140);
        const pageStr = `Page ${data.pageNumber}`;
        pdf!.text(pageStr, pageWidth - margin, pageHeight - 8, { align: "right" });
        pdf!.setTextColor(0);
      },
      columnStyles: Object.fromEntries(
        Array.from({ length: colCount }, (_, idx) => [
          idx,
          {
            cellWidth: "auto" as const,
            minCellWidth: Math.min(28, (pageW - margin * 2) / Math.max(colCount, 1)),
          },
        ])
      ),
    });

    sheetsRendered++;
  }

  if (!pdf || sheetsRendered === 0) {
    const empty = new jsPDF();
    empty.setFontSize(12);
    empty.text("No tabular data could be extracted from this file.", 20, 30);
    return {
      blob: empty.output("blob"),
      warnings: warnings.length ? warnings : ["No tabular data found."],
    };
  }

  if (sheetNames.length > 1 && sheetsRendered < sheetNames.length) {
    warnings.push(`Rendered ${sheetsRendered} of ${sheetNames.length} sheets.`);
  }

  return { blob: pdf.output("blob"), warnings };
}

/**
 * Convert an Excel/CSV ArrayBuffer into a multi-sheet PDF with table formatting.
 */
export async function convertExcelToPdf(
  arrayBuffer: ArrayBuffer,
  fileName: string
): Promise<ExcelToPdfResult> {
  const wb = XLSX.read(arrayBuffer, {
    type: "array",
    cellDates: true,
    cellNF: false,
    cellText: true,
  });

  return buildPdfFromWorkbook(wb, fileName);
}
