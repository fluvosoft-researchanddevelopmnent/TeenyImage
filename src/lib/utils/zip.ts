import JSZip from "jszip";

export interface ZipFileItem {
  name: string;
  blob: Blob | Uint8Array | ArrayBuffer | string;
}

/**
 * Packages multiple files into a single client-side ZIP archive.
 * 100% in-browser, no server transmission.
 */
export async function createZip(
  files: ZipFileItem[],
  zipName: string = "teenyimage_bundle.zip"
): Promise<{ blob: Blob; fileName: string }> {
  const zip = new JSZip();

  // Deduplicate file names if any
  const nameCounts = new Map<string, number>();

  for (const file of files) {
    let finalName = file.name;
    const count = nameCounts.get(finalName) || 0;
    if (count > 0) {
      const lastDot = finalName.lastIndexOf(".");
      if (lastDot !== -1) {
        finalName = `${finalName.substring(0, lastDot)}_${count}${finalName.substring(lastDot)}`;
      } else {
        finalName = `${finalName}_${count}`;
      }
    }
    nameCounts.set(file.name, count + 1);

    zip.file(finalName, file.blob);
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const finalZipName = zipName.endsWith(".zip") ? zipName : `${zipName}.zip`;

  return {
    blob: zipBlob,
    fileName: finalZipName,
  };
}
