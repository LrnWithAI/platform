"use server";

import { createClient } from "@/utils/supabase/server";

/* GET Classes */
export async function getClasses() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.from("class").select("*");

    if (error) throw new Error(error.message);

    return { success: true, message: "Classes fetched successfully", data };
  } catch (error) {
    console.error("Error fetching classes:", error);
    return { success: false, message: (error as Error).message, data: [] };
  }
}

/* GET Class by ID */
export async function getClassById(id: number) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.from("class").select("*").eq("id", id).single();

    if (error) throw new Error(error.message);

    return { success: true, message: "Class fetched successfully", data };
  } catch (error) {
    console.error("Error fetching class by ID:", error);
    return { success: false, message: (error as Error).message, data: {} };
  }
}

/* CREATE Class */
export async function createClass(data: any) {
  const supabase = await createClient();

  try {
    const { data: result, error } = await supabase.from("class").insert([data]).select("*");

    if (error) throw new Error(error.message);

    return { success: true, message: "Class created successfully", data: result };
  } catch (error) {
    console.error("Error creating class:", error);
    return { success: false, message: (error as Error).message };
  }
}

/* EDIT Class */
export async function editClass(id: number, data: any) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("class").update(data).eq("id", id);

    if (error) throw new Error(error.message);

    return { success: true, message: "Class edited successfully" };
  } catch (error) {
    console.error("Error editing class:", error);
    return { success: false, message: (error as Error).message };
  }
}

/* DELETE Class */
export async function deleteClass(id: number) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("class").delete().eq("id", id);

    if (error) throw new Error(error.message);

    return { success: true, message: "Class deleted successfully" };
  } catch (error) {
    console.error("Error deleting class:", error);
    return { success: false, message: (error as Error).message };
  }
}