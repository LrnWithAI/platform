import z from "zod";

export const ClassSchema = z.object({
  title: z.string().nonempty("Title is required."),
  name: z.string().nonempty("Name is required."),
  class_time: z
    .string()
    .regex(
      /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) \d{2}:\d{2}$/,
      "Class time must be in the format 'Day HH:mm', e.g., 'Mon 09:00'."
    ),
  year: z
    .string()
    .regex(
      /^(\d{4} \/ \d{4}|\d{4})$/,
      "Year must be a single year (e.g., '2025') or a range (e.g., '2024 / 2025')."
    ),
  // image: z
  //   .custom<File | undefined>((file) => {
  //     if (!file) return true; // Ak nie je súbor, je to OK (voliteľné pole)
  //     return file instanceof File && file.type.startsWith("image/");
  //   }, "Only image files are allowed.")
  //   .optional()

  image: z
    .custom<File | undefined>((file) => {
      if (file === undefined || file === null || file === '') {
        return true; // Ak nie je súbor, je to OK (voliteľné pole)
      }
      return file instanceof File && file.type.startsWith('image/');
    }, 'Only image files are allowed.')

    .optional()
});