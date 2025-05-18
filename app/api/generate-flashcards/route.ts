import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import pdf from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const { pdfUrl, numFlashcards = 5 } = await req.json();

    if (!pdfUrl) {
      return NextResponse.json({ error: "Missing PDF URL" }, { status: 400 });
    }

    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    // ✅ Ensure we're using Uint8Array, not Buffer (Vercel-compatible)
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const pdfData = await pdf(data);
    const trimmedText = pdfData.text.slice(0, 10000); // Limit to safe size

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

Flashcards must be relevant to the text. Use the same language as the text. Do not include metadata or explanations.

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
      console.error("Failed to parse OpenAI response:", raw);
      flashcards = [{ error: "Invalid JSON from OpenAI" }];
    }

    return NextResponse.json({ flashcards });
  } catch (error: unknown) {
    console.error(
      "Error generating flashcards:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to process PDF and generate flashcards" },
      { status: 500 }
    );
  }
}
