import { z } from "zod";

export const noteSchema = z.object({
  id: z.number().int().optional(),
  title: z.string().min(1, "Title is required."),
  content: z.string().min(1, "Content is required."),
  created_by: z.string().uuid().optional(),
  created_at: z.date().optional()
});