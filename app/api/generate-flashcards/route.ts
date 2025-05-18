import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export async function POST(req: NextRequest) {
  try {
    const { pdfUrl, numFlashcards = 5 } = await req.json();
    console.log("Received request with PDF URL:", pdfUrl);

    if (!pdfUrl) {
      return NextResponse.json({ error: "Missing PDF URL" }, { status: 400 });
    }

    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const dataBuffer = new Uint8Array(arrayBuffer);

    const loadingTask = pdfjs.getDocument({ data: dataBuffer });
    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageText = content.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    const trimmedText = fullText.slice(0, 10000); // Limit for prompt

    const prompt = `You are an AI assistant. Your task is to generate ${numFlashcards} flashcards based on the provided text content.

Each flashcard should have term and definition: front side is term and back side is definition.
Return the flashcards in JSON format using the following structure:

[
  {
    "id": 1,
    "term": "What's the current president of Slovakia?",
    "definition": "Pellegrini"
  }
]

Flashcards should be relevant to the text and in the same language as the input. Do not include explanations or phrases like "Based on the text".

# Text:
${trimmedText}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = chatResponse.choices[0]?.message?.content || "[]";

    let flashcards;
    try {
      flashcards = JSON.parse(raw);
    } catch {
      console.error("Failed to parse OpenAI response:", raw);
      flashcards = [{ error: "Failed to parse JSON response from OpenAI" }];
    }

    return NextResponse.json({ flashcards });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error generating flashcards:", message);
    return NextResponse.json(
      { error: "Error processing PDF and generating flashcards" },
      { status: 500 }
    );
  }
}
