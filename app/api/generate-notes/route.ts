import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { extractTextFromPdf } from "@/utils/pdfTextExtract";

export async function POST(req: NextRequest) {
  try {
    const { pdfUrl, prompt, options } = await req.json();
    const { length = "medium", style = "summary", language = "en" } = options || {};

    let inputText = "";

    if (pdfUrl) {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const dataBuffer = Buffer.from(arrayBuffer);

      const pdfData = await extractTextFromPdf(dataBuffer);
      inputText = pdfData.slice(0, 15000);
    } else if (prompt) {
      inputText = prompt;
    } else {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    const aiPrompt = `You are an AI assistant. Your task is to generate structured study notes based on the input below.

    Style: ${style}
    Length: ${length}

    Input:
    ${inputText}

    Output format:
    - Use markdown formatting.
    - Use bullet points for lists if style is 'bullet'.
    - Use paragraphs and subheadings (##) for detailed or summary styles.
    - Highlight key terms using **bold**.
    - Do not include introductory or closing remarks like 'Here are your notes'.

    The notes must be written strictly and entirely in the following language: ${language.toUpperCase()}.
    Do not translate anything into English. Do not mix languages.`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: aiPrompt }],
    });

    const content = chatResponse.choices[0]?.message?.content || "";
    return NextResponse.json({ success: true, content });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error generating note:", error.message);
    } else {
      console.error("Unknown error:", error);
    }

    return NextResponse.json({ error: "Failed to generate note" }, { status: 500 });
  }
}