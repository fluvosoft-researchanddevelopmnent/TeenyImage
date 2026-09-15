/**
 * removeBackground.ts
 * Thin, client-side wrapper around @imgly/background-removal (WASM).
 * Runs entirely in the browser — the library itself never uploads image
 * data anywhere. The package is dynamically imported so its (larger) WASM
 * payload is only fetched when a user actually visits this tool page.
 */

export type RemoveBackgroundStage = "analyzing" | "removing" | "done";

export interface RemoveBackgroundOptions {
  onProgress?: (stage: RemoveBackgroundStage) => void;
}

export async function removeBackground(file: File, options: RemoveBackgroundOptions = {}): Promise<Blob> {
  const { onProgress } = options;

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a JPG, PNG, or WEBP image.");
  }

  onProgress?.("analyzing");

  // Lazy-loaded so this heavy WASM-backed dependency never ships in the
  // initial bundle for pages other than /remove-background.
  const { removeBackground: runRemoval } = await import("@imgly/background-removal");

  onProgress?.("removing");

  try {
    const result = await runRemoval(file);
    onProgress?.("done");
    return result as Blob;
  } catch {
    throw new Error(
      "Background removal failed for this image. Try a different photo, or one with a clearer subject."
    );
  }
}
