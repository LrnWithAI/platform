"use client";

import { createClient } from "@/utils/supabase/client";

export async function register(formData: FormData) {
  const supabase = createClient();

  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
      },
    });

    if (error) throw new Error(error.message);

    return { success: true, message: "Registration successful!" };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, message: (error as Error).message };
  }
}
