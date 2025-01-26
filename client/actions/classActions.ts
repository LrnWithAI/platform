"use server";

import { createClient } from "@/utils/supabase/server";

/* GET Classes */
export async function getClasses() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("class").select(`*`);

  if (error) {
    console.error("Error fetching classes:", error.message);
    return { success: false, message: error.message, data: [] };
  } else {
    return { success: true, message: "Classes successfully fetched", data: data };
  }
}

/* DELETE Class */
export async function deleteClass(id: number) {
  const supabase = await createClient();

  const { error } = await supabase.from("class").delete().eq("id", id);

  if (error) {
    console.error("Error deleting class:", error.message);
    return { success: false, message: error.message };
  } else {
    return { success: true, message: "Class successfully deleted" };
  }
}

/* EDIT Class */
export async function editClass(id: number, data: any) {
  const supabase = await createClient();

  const { error } = await supabase.from("class").update(data).eq("id", id);

  if (error) {
    console.error("Error editing class:", error.message);
    return { success: false, message: error.message };
  } else {
    return { success: true, message: "Class successfully edited" };
  }
}

/* CREATE Class */
export async function createClass(data: any) {
  const supabase = await createClient();

  const { data: result, error } = await supabase.from("class").insert([data]);

  if (error) {
    console.error("Error creating class:", error.message);
    return { success: false, message: error.message };
  }
  return { success: true, data: result };
};

/* GET Class by ID */
export async function getClassById(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("class").select(`*`).eq("id", id).single();

  if (error) {
    console.error("Error fetching class by ID:", error.message);
    return { success: false, message: error.message, data: {} };
  } else {
    return { success: true, message: "Class successfully fetched", data: data };
  }
}