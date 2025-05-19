import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    const { pdfUrl, numFlashcards = 5 } = await req.json();
    console.log("Received request with PDF URL:", pdfUrl);

    if (!pdfUrl) {
      return NextResponse.json({ error: "Missing PDF URL" }, { status: 400 });
    }

    const response = await fetch(pdfUrl);
    console.log("Fetched PDF from URL, response status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const dataBuffer = Buffer.from(arrayBuffer);

    const pdf = (await import("pdf-parse")).default;
    const pdfData = await pdf(dataBuffer);
    console.log("Extracted text from PDF");

    const text = pdfData.text.slice(0, 10000); // Trim for GPT

    const prompt = `You are an AI assistant. Your task is to generate ${numFlashcards} flashcards based on the provided text content.

Each flashcard should have term and definition: front side is term and back side is definition.
Return the flashcards in JSON format using the following structure:

[
  {
    "id": 1,
    "term": "What's the currect president of Slovakia?",
    "definition": "Pelegriny"
  },
]

Flashcards should be relevant to the text and should be in the same language as the text is so if the text is in Slovak the flashcards both sides should be in Slovak too. Don't include "based on the text" in the flashcards e.g. "Based on the text, what is the capital of France?" should be "What is the capital of France?".

# Text:

${text}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    console.log("OpenAI response received");

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
    if (error instanceof Error) {
      console.error("Error generating flashcards questions:", error.message);
    } else {
      console.error("Unknown error:", error);
    }

    return NextResponse.json(
      { error: "Error processing PDF and generating questions" },
      { status: 500 }
    );
  }
}
