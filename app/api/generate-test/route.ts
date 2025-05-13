import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    const { pdfUrl, numQuestions = 5 } = await req.json();
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

    const prompt = `You are an AI assistant. Your task is to generate ${numQuestions} multiple-choice questions based on the provided text content.

Each question should have four answer options: one correct and three incorrect. Correct answer should be on position anywhere from 0 to 3 (don't stick to 0 as there is the example in the json below). 
Return the questions in JSON format using the following structure:

[
  {
    "id": 1,
    "question": "Your question here",
    "answers": ["Incorrect 0", "Correct 1", "Incorrect 2", "Incorrect 3"],
    "correct": index of correct answer (0-3)
  }
]

Questions should be relevant to the text and should be in the same language as the text is so if the text is in Slovak the questions should be in Slovak too. Don't include "based on the text" in the questions e.g. "Based on the text, what is the capital of France?" should be "What is the capital of France?".

# Text:

${text}`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    console.log("OpenAI response received");

    const raw = chatResponse.choices[0]?.message?.content || "[]";
    let questions;
    try {
      questions = JSON.parse(raw);
    } catch {
      console.error("Failed to parse OpenAI response:", raw);
      questions = [{ error: "Failed to parse JSON response from OpenAI" }];
    }

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error("Unhandled error in POST /generate-questions:", error);
    return NextResponse.json(
      { error: "Error processing PDF and generating questions" },
      { status: 500 }
    );
  }
}
