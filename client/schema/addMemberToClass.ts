import { z } from "zod";

export const addMemberToClassSchema = z.object({
  email: z.string().email("Invalid email address"),
});