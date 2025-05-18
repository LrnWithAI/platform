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

    const pdfjsLib = await import("pdfjs-dist");
    const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
    const pdf = await loadingTask.promise;

    let extractedText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      extractedText += pageText + "\n";
    }

    const text = extractedText.slice(0, 10000); // Optional: limit input size

    const prompt = `You are an AI assistant. Your task is to generate ${numQuestions} multiple-choice questions based on the provided text content.

Each question should have four answer options: one correct and three incorrect. The correct answer should be randomly placed (not always index 0).
Return the questions in JSON format using this structure:

[
  {
    "id": 1,
    "question": "Your question here",
    "answers": ["Incorrect 1", "Correct", "Incorrect 2", "Incorrect 3"],
    "correct": 1
  }
]

Ensure questions are relevant and match the language of the input. Avoid phrases like "Based on the text".

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
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error generating test:", error.message);
    } else {
      console.error("Unknown error:", error);
    }

    return NextResponse.json(
      { error: "Error processing PDF and generating questions" },
      { status: 500 }
    );
  }
}
