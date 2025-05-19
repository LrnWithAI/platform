import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Dynamically load the CommonJS-compatible wrapper
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  const maxPages = pdf.numPages;

  let fullText = "";

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(" ") + "\n";
  }

  return fullText.trim();
}
