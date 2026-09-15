/**
 * types.ts
 * Shared canvas element types for the Photo Editor tool (@shafinSI scope).
 */

export type EditorToolId =
  | "select"
  | "text"
  | "pencil"
  | "highlighter"
  | "shape-rect"
  | "shape-circle"
  | "shape-triangle"
  | "shape-line"
  | "shape-arrow"
  | "eraser"
  | "image";

export interface Point {
  x: number;
  y: number;
}

interface BaseLayer {
  id: string;
  /** True while the user is actively drawing/dragging this layer's first stroke. */
  visible: boolean;
}

export interface PathLayer extends BaseLayer {
  type: "path";
  points: Point[];
  color: string;
  strokeWidth: number;
  /** Highlighter uses a translucent, wider stroke and "multiply"-like blending. */
  kind: "pencil" | "highlighter" | "eraser";
}

export interface ShapeLayer extends BaseLayer {
  type: "shape";
  shape: "rect" | "circle" | "triangle" | "line" | "arrow";
  start: Point;
  end: Point;
  color: string;
  strokeWidth: number;
}

export interface TextLayer extends BaseLayer {
  type: "text";
  position: Point;
  text: string;
  color: string;
  fontSize: number;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  position: Point;
  width: number;
  height: number;
  src: string; // object URL
}

export type EditorLayer = PathLayer | ShapeLayer | TextLayer | ImageLayer;

export interface EditorDocument {
  baseImageSrc: string;
  baseWidth: number;
  baseHeight: number;
  layers: EditorLayer[];
}

export const SWATCH_COLORS = [
  "#000000",
  "#ffffff",
  "#e5322d",
  "#2563eb",
  "#16a34a",
  "#eab308",
] as const;
