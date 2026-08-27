export type EditorTool =
  | "pan"
  | "text"
  | "image"
  | "pen"
  | "shape"
  | "highlight"
  | "eraser";

export type ShapeKind = "rect" | "ellipse" | "line" | "triangle" | "arrow";

type AnnotationBase = {
  id: string;
  pageIndex: number;
  /** Higher draws on top */
  zIndex: number;
};

export type TextAnnotation = AnnotationBase & {
  type: "text";
  /** Normalized 0–1 relative to page (top-left origin) */
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  bold?: boolean;
};

export type ImageAnnotation = AnnotationBase & {
  type: "image";
  x: number;
  y: number;
  w: number;
  h: number;
  dataUrl: string;
};

export type PenAnnotation = AnnotationBase & {
  type: "pen";
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  /** Soft translucent stroke used like a highlighter */
  highlight?: boolean;
};

export type ShapeAnnotation = AnnotationBase & {
  type: "shape";
  shape: ShapeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  strokeWidth: number;
  fill?: string;
};

export type Annotation = TextAnnotation | ImageAnnotation | PenAnnotation | ShapeAnnotation;

export function createId(): string {
  return `ann_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
