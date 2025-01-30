"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/* Register */
export async function register(formData: FormData) {
  const supabase = await createClient();

  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) throw new Error(error.message);

    return { success: true, message: "Registration successful!" };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, message: (error as Error).message };
  }
}

/* Login */
export async function login(formData: FormData) {
  const supabase = await createClient();

  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw new Error(error.message);

    revalidatePath("/", "layout");
    return { success: true, message: "Login successful!" };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, message: (error as Error).message };
  }
}

/* Forgot Password */
export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();

  try {
    const email = formData.get("email") as string;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.NEXT_PUBLIC_UPDATE_PASSWORD_URL || "http://localhost:3000/update-password",
    });

    if (error) throw new Error(error.message);

    return { success: true, message: "Password reset email sent!" };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, message: (error as Error).message };
  }
}

/* Update Password */
export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  try {
    const newPassword = formData.get("password") as string;
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) throw new Error(error.message);

    return { success: true, message: "Password updated successfully!" };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, message: (error as Error).message };
  }
}