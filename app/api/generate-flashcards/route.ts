import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import pdf from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const { pdfUrl, numFlashcards = 5 } = await req.json();

    if (!pdfUrl) {
      return NextResponse.json({ error: "Missing PDF URL" }, { status: 400 });
    }

    // Fetch the PDF from the URL
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const dataBuffer = new Uint8Array(arrayBuffer);

    // Parse the PDF text content
    const pdfData = await pdf(dataBuffer);
    const trimmedText = pdfData.text.slice(0, 10000);

    // Prompt for OpenAI
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
