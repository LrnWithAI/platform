"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem, CommandGroup } from "@/components/ui/command";
import { useUserStore } from "@/stores/userStore";
import { createNote, updateNote } from "@/actions/notesActions";
import { uploadAiFileToNotesBucket } from "@/actions/storageActions";
import { FileUpload } from "./ui/file-upload";
import { languages } from "@/lib/consts";
import { Globe } from "lucide-react";
import { extractTextFromPdfUrl } from "@/utils/pdfTextExtract";

export default function CreateNoteWithAI() {
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const [pdf, setPdf] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");

  const [inputType, setInputType] = useState<"prompt" | "pdf">("prompt");
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [length, setLength] = useState("medium");
  const [style, setStyle] = useState("summary");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  async function generateNoteAI({
    prompt,
    pdfUrl,
    options,
  }: {
    prompt?: string;
    pdfUrl?: string;
    options: { length: string; style: string; language: string };
  }): Promise<string | null> {
    try {
      let inputText = prompt;

      if (pdfUrl) {
        inputText = await extractTextFromPdfUrl(pdfUrl);
      }

      const res = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputText, options }),
      });

      const data = await res.json();
      return data.success ? data.content : null;
    } catch (error) {
      console.error("AI note generation failed:", error);
      return null;
    }
  }

  const handleGenerate = async () => {
    if (!user?.id) return toast.error("Missing user ID");
    if (!title) return toast.error("Please enter a title for the note.");
    if (inputType === "prompt" && !prompt) return toast.error("Prompt is empty.");
    if (inputType === "pdf" && !pdf) return toast.error("No PDF file selected.");

    setIsGenerating(true);

    const baseNote = {
      title: title,
      content: "",
      public: isPublic,
      created_at: new Date().toISOString(),
      created_by: {
        id: String(user.id),
        name: user.full_name,
        role: user.role,
        email: user.email,
        username: user.username,
      },
      files: [],
    };

    const res = await createNote(baseNote);
    if (!res.success || !res.data?.id) {
      toast.error("Failed to create note record");
      setIsGenerating(false);
      return;
    }
    const noteId = res.data.id;

    let aiInputText = "";

    if (inputType === "pdf" && pdf) {
      aiInputText = await extractTextFromPdfUrl(URL.createObjectURL(pdf));

      const url = await uploadAiFileToNotesBucket(pdf, user.id, noteId);
      if (!url) {
        toast.error("Failed to upload PDF file.");
        setIsGenerating(false);
        return;
      }
    } else if (inputType === "prompt") {
      aiInputText = prompt;
    }

    const aiContent = await generateNoteAI({
      prompt: aiInputText,
      options: {
        length,
        style,
        language: selectedLanguage,
      },
    });

    if (!aiContent) {
      toast.error("AI failed to generate the note.");
      setIsGenerating(false);
      return;
    }

    await updateNote({
      id: noteId,
      ...baseNote,
      content: aiContent,
    });

    toast.success("Note generated, redirecting...");
    router.push(`/notes/${noteId}`);
  };

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    setIsDropdownOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-2 mt-2">
        Create a Note with AI
      </h2>

      <div className="bg-sidebar border rounded-xl p-8 space-y-6 shadow-md">
        <div className="space-y-2">
          <Label>Note Title</Label>
          <Input
            value={title}
            placeholder="e.g. Basics of Quantum Computing"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Choose Input Method</Label>
          <div className="flex gap-4">
            <Button
              variant={inputType === "prompt" ? "default" : "outline"}
              onClick={() => {
                setInputType("prompt");
                setPdf(null);
              }}
            >
              Use Prompt
            </Button>
            <Button
              variant={inputType === "pdf" ? "default" : "outline"}
              onClick={() => {
                setInputType("pdf");
                setPrompt("");
              }}
            >
              Upload PDF
            </Button>
          </div>
        </div>

        {inputType === "prompt" && (
          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              placeholder="e.g. Create a summary of the Renaissance period"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
        )}

        {inputType === "pdf" && (
          <div className="space-y-2">
            <Label>Upload PDF</Label>
            <FileUpload onChange={(files) => setPdf(files[0])} />
          </div>
        )}

        <div className="space-y-2">
          <Label>Length</Label>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="border rounded-md p-2 w-full"
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Style</Label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="border rounded-md p-2 w-full"
          >
            <option value="summary">Summary</option>
            <option value="bullet">Bullet Points</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label>Language</Label>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2 items-center w-full justify-between">
                <Globe size={16} />
                <span>{languages.find((l) => l.code === selectedLanguage)?.short.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 p-0">
              <Command>
                <CommandInput placeholder="Search language..." className="h-9" />
                <CommandList className="max-h-64 overflow-y-auto">
                  <CommandEmpty>Jazyk nenájdený.</CommandEmpty>
                  <CommandGroup>
                    {languages.map((lang) => (
                      <CommandItem
                        key={lang.code}
                        onSelect={() => handleLanguageChange(lang.code)}
                        className="cursor-pointer"
                      >
                        {lang.short} – {lang.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="public"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
          <Label htmlFor="public" className="cursor-pointer">Make this note public</Label>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-blue-600 text-white"
          >
            {isGenerating ? "Generating..." : "Generate Note"}
          </Button>
        </div>
      </div>
    </div>
  );
}