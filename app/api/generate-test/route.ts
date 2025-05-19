import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, numQuestions = 5 } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or empty input text" },
        { status: 400 }
      );
    }

    const aiPrompt = `You are an AI assistant. Your task is to generate ${numQuestions} multiple-choice questions based on the provided text content.

Each question should have four answer options: one correct and three incorrect. The correct answer can be at any index from 0 to 3.

Return the questions in valid JSON format using the following structure:

[
  {
    "id": 1,
    "question": "What is the capital of France?",
    "answers": ["Berlin", "Madrid", "Paris", "Rome"],
    "correct": 2
  }
]

Guidelines:
- Use only information from the text.
- Do not include explanations or metadata.
- Return only a JSON array of question objects.
- Do not say "Based on the text".
- Maintain the original language used in the input.

# Text:
${prompt}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: aiPrompt }],
    });

    const raw = chatResponse.choices[0]?.message?.content || "[]";

    let questions;
    try {
      questions = JSON.parse(raw);
    } catch {
      console.error("❌ Failed to parse OpenAI response:", raw);
      questions = [{ error: "Invalid response format from OpenAI" }];
    }

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error("❌ Error generating test:", error);
    return NextResponse.json(
      { error: "Failed to generate test questions." },
      { status: 500 }
    );
  }
}
