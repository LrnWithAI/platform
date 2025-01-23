"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const newPassword = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    console.error("Error updating password:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, message: "Password updated successfully!" };
}