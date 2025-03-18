import { z } from "zod";

export const accountSchema = z.object({
  firstName: z.string().min(3, "Must be at least 3 characters."),
  lastName: z.string().min(3, "Must be at least 3 characters."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  website: z.string().url().optional().nullable(),
  phone: z.preprocess(
    (val) => {
      // Ak je hodnota prázdny reťazec, vrátime undefined.
      if (typeof val === "string" && val.trim() === "") {
        return undefined;
      }
      return val;
    },
    z.string()
      .min(10, "Phone number must be at least 10 characters.")
      .optional()
  ),
  workplace: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  whatIDo: z.string().optional().nullable(),
  announcements: z.string().optional().nullable()
});
