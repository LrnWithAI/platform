"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword(data);

  if (authError) {
    console.error("Error logging in user:", authError);
    return { success: false, message: authError.message };
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Login successful!" };
}
