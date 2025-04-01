"use client";

import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function CreateFlashcards() {
  const params = useSearchParams();

  const option = params.get("option");

  return (
    <div>
      <div className="flex flex-row justify-center my-8">
        <h2 className="text-2xl font-bold">
          Create a new flashcards set{" "}
          {option == "withAI" ? "with AI" : "manually"}
        </h2>
      </div>

      <div className="flex flex-col justify-center max-w-4xl mx-auto">
        <div className="dark:bg-muted border rounded-md p-6 space-y-4 bg-gray-100">
          <div className="space-y-2">
            <Label htmlFor="test-title">Flashcards set title</Label>
            <Input
              id="test-title"
              type="text"
              placeholder="Enter a title, like Introduction to AI"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
