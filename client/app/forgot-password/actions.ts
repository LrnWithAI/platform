"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:3000/update-password',
  });

  if (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Password reset email sent!" };
}
