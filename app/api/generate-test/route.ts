import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OpenAI } from "openai";
import pdf from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const { pdfUrl, numQuestions = 5 } = await req.json();

    if (!pdfUrl) {
      return NextResponse.json({ error: "Missing PDF URL" }, { status: 400 });
    }

    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const dataBuffer = new Uint8Array(arrayBuffer);

    const pdfData = await pdf(dataBuffer);
    const trimmedText = pdfData.text.slice(0, 10000);

    const prompt = `You are an AI assistant. Your task is to generate ${numQuestions} multiple-choice questions based on the provided text content.

Each question should have four answer options: one correct and three incorrect. Correct answer can be at any index from 0 to 3.

Return the questions in JSON format using the following structure:

[
  {
    "id": 1,
    "question": "What is the capital of France?",
    "answers": ["Berlin", "Madrid", "Paris", "Rome"],
    "correct": 2
  }
]

Use the same language as the source text. Don't say "Based on the text". Keep the questions direct.

# Text:

${trimmedText}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = chatResponse.choices[0]?.message?.content || "[]";
    let questions;
    try {
      questions = JSON.parse(raw);
    } catch {
      console.error("Failed to parse OpenAI response:", raw);
      questions = [{ error: "Invalid response format from OpenAI" }];
    }

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error(
      "Error generating test:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to process PDF and generate questions" },
      { status: 500 }
    );
  }
}
