import { z } from "zod";

export const flashcardsSchema = z.object({
  id: z.number().int().optional(),
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  visibility: z.string().min(1, "Visibility is required."),
  category: z.string().min(1, "Category is required."),
  flashcards: z
    .array(
      z.object({
        id: z.number().int().optional(),
        term: z.string().min(1, "Term is required."), // like question
        definition: z.string().min(1, "Definition is required."), // like answer
        image_url: z.string().optional(),
      })
    )
    .min(1, "At least one flashcard is required."),
  created_by: z.string().uuid().optional(),
});
