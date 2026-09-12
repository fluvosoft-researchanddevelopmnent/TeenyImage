declare module "jspdf" {
  export interface jsPDFOptions {
    orientation?: "p" | "portrait" | "l" | "landscape";
    unit?: "pt" | "px" | "in" | "mm" | "cm" | "ex" | "em" | "pc";
    format?: string | number[];
    compress?: boolean;
    precision?: number;
    userUnit?: number;
    hotfixes?: string[];
    encryption?: {
      userPassword?: string;
      ownerPassword?: string;
      userPermissions?: ("print" | "modify" | "copy" | "annot-forms")[];
    };
    putOnlyUsedFonts?: boolean;
    floatPrecision?: number | "smart";
  }

  export class jsPDF {
    constructor(options?: jsPDFOptions);
    addPage(format?: string | number[], orientation?: "p" | "portrait" | "l" | "landscape"): this;
    addImage(
      imageData: string | HTMLImageElement | HTMLCanvasElement | Uint8Array,
      format: string,
      x: number,
      y: number,
      w: number,
      h: number,
      alias?: string,
      compression?: "NONE" | "FAST" | "MEDIUM" | "SLOW",
      rotation?: number
    ): this;
    output(type: "blob"): Blob;
    output(type: "datauristring" | "dataurlstring"): string;
    output(type: "arraybuffer"): ArrayBuffer;
    output(type: string): unknown;
    save(filename: string): void;
  }

  export default jsPDF;
}
