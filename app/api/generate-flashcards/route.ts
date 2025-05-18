import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

export async function POST(req: NextRequest) {
  try {
    const { pdfUrl, numFlashcards = 5 } = await req.json();

    if (!pdfUrl) {
      return NextResponse.json({ error: "Missing PDF URL" }, { status: 400 });
    }

    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error(`Failed to download PDF`);

    const buffer = await response.arrayBuffer();
    const data = new Uint8Array(buffer);

    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;

    let textContent = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageText = content.items.map((item: any) => item.str).join(" ");
      textContent += pageText + "\n";
    }

    const trimmedText = textContent.slice(0, 10000);

    const prompt = `You are an AI assistant. Your task is to generate ${numFlashcards} flashcards based on the provided text content.

Each flashcard should have term and definition: front side is term and back side is definition.
Return the flashcards in JSON format using this structure:

[
  {
    "id": 1,
    "term": "Example Term",
    "definition": "Example Definition"
  }
]

# Text:
${trimmedText}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = chatResponse.choices[0]?.message?.content || "[]";
    let flashcards;
    try {
      flashcards = JSON.parse(raw);
    } catch {
      flashcards = [{ error: "Invalid JSON from OpenAI" }];
    }

    return NextResponse.json({ flashcards });
  } catch (error: unknown) {
    console.error("Error generating flashcards:", error);
    return NextResponse.json(
      { error: "Failed to process PDF and generate flashcards" },
      { status: 500 }
    );
  }
}
