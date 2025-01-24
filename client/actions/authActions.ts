"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

/* Register */
export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });

  if (authError) {
    console.error("Error registering user:", authError);
    return { success: false, message: authError.message };
  }

  revalidatePath("/");
  return { success: true, message: "Registration successful!" };
}

/* Login */
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

/* Forgot Password */
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

/* Update Password */
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