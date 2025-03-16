import { z } from "zod";

export const accountSchema = z.object({
  firstName: z.string().min(3, "Must be at least 3 characters."),
  lastName: z.string().min(3, "Must be at least 3 characters."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  website: z.string().url().optional().nullable(),
  phone: z.string().min(10, "Phone number must be at least 10 characters."),
  workplace: z.string().min(3, "Workplace must be at least 3 characters."),
});
