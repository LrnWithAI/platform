import { z } from "zod";

export const testSchema = z.object({
  id: z.number().int().optional(),
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  visibility: z.string().min(1, "Visibility is required."),
  category: z.string().min(1, "Category is required."),
  questions: z
    .array(
      z.object({
        id: z.number().int().optional(),
        question: z.string().min(1, "Question text is required."),
        answers: z
          .array(z.string().min(1, "Answer cannot be empty."))
          .min(1, "At least one answer is required."),
        correct: z
          .number()
          .int()
          .min(0, "Correct answer index must be a non-negative integer."),
        image_url: z.string().optional(),
      })
    )
    .min(1, "At least one question is required."),
  created_by: z.string().uuid().optional(),
});
