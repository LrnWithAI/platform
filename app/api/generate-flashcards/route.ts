import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, numFlashcards = 5 } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or empty input text" },
        { status: 400 }
      );
    }

    const aiPrompt = `You are an AI assistant. Your task is to generate ${numFlashcards} flashcards based on the provided text.

Each flashcard should consist of a **term** and a **definition**.

Output format:
[
  {
    "id": 1,
    "term": "What is the capital of Slovakia?",
    "definition": "Bratislava"
  }
]

Guidelines:
- All flashcards must be directly derived from the source text.
- Do not include any notes, explanations, or context outside the JSON array.
- Keep terms and definitions in the exactly same language as the input (e.g. if text is in Slovak language the flashcards both term and definition should be in Slovak as well).
- Do not use phrases like "Based on the text" in the flashcards.

# Text:
${prompt}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: aiPrompt }],
    });

    const raw = chatResponse.choices[0]?.message?.content || "[]";

    let flashcards;
    try {
      flashcards = JSON.parse(raw);
    } catch {
      console.error("❌ Failed to parse OpenAI response:", raw);
      flashcards = [{ error: "Invalid response format from OpenAI" }];
    }

    return NextResponse.json({ flashcards });
  } catch (error: unknown) {
    console.error("❌ Error generating flashcards:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards." },
      { status: 500 }
    );
  }
}
