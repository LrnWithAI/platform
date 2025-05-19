import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, options } = await req.json();

    const { length = "medium", style = "summary", language = "en" } = options || {};

    if (!prompt) {
      return NextResponse.json({ error: "Missing input text" }, { status: 400 });
    }

    const aiPrompt = `You are an AI assistant. Your task is to generate structured study notes based on the input below.

    Style: ${style}
    Length: ${length}

    Input:
    ${prompt}
    
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
    console.error("Error generating note:", error);
    return NextResponse.json(
      { error: "Failed to generate note" },
      { status: 500 }
    );
  }
}