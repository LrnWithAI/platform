"use server";

import { createClient } from "@/utils/supabase/server";

/* GET User */
export const getUserProfile = async (id: string) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();

    if (error) throw new Error(error.message);

    return { success: true, message: "User fetched successfully", data };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, message: (error as Error).message, data: {} };
  }
};

/* GET User by username */
export const getUserByUsername = async (username: string) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("username", username).single();

    if (error) throw new Error(error.message);

    return { success: true, message: "User fetched successfully", data };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, message: (error as Error).message, data: {} };
  }
}

/* UPDATE User */
export const updateUserProfile = async (id: string, data: any) => {
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").upsert({
    id,
    ...data,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "User updated successfully" };
};