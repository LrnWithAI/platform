const PDFParser = require("pdf2json");

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(errData.parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      const texts = pdfData?.formImage?.Pages?.flatMap((page: any) =>
        page.Texts.map((textObj: any) =>
          decodeURIComponent(textObj.R[0].T)
        )
      );

      resolve(texts?.join(" ") ?? "");
    });

    pdfParser.parseBuffer(buffer);
  });
}
