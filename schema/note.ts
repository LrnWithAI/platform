import { z } from "zod";

export const noteSchema = z.object({
  id: z.number().int().optional(),
  title: z.string().min(1, "Title is required."),
  content: z.string().min(1, "Content is required."),
  created_at: z.date().optional(),
  public: z.boolean().default(false)
});