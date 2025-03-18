"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { addStudentToClass } from "./classActions";

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

/* Send invite email to join class */
export async function inviteToClass(email: string, classId: number) {
  const supabase = await createClient();

  // 1. Načítaj triedu podľa ID
  const { data: classData, error: classError } = await supabase
    .from("class")
    .select("members")
    .eq("id", classId)
    .single();

  if (classError) throw new Error(classError.message);

  // 2. Skontroluj, či užívateľ už nie je v members
  const isAlreadyMember = classData.members?.some((member: any) => member.email === email);

  if (isAlreadyMember) {
    return { success: false, message: "User is already in class!" };
  }

  // 3. Skontroluj, či už existuje v profiles
  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (user) {
    // ✅ Pridáme ho rovno do members
    await addStudentToClass(classId, {
      id: user.id,
      name: user.full_name,
      username: user.username,
      role: user.role,
      email: user.email,
    });

    return { success: true, message: "User added to class!" };
  }

  if (userError) {
    console.error("User doesn't exist:", userError.message);
    return { success: false, message: "User doesn't exist" };
  }
}
