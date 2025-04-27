"use server";

import { createClient } from "@/utils/supabase/server";
import { Note } from "@/types/note";

/* GET Notes by user ID */
export async function getNotesByUserId(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("notes").select("*").eq("created_by->>id", userId).order("created_at", { ascending: false });

  if (error) {
    return { success: false, message: error.message, data: [], };
  }

  return { success: true, message: "Notes fetched successfully", data: data as Note[] };
}

/* GET Note by ID */
export async function getNoteById(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("notes").select("*").eq("id", id).single();

  if (error) {
    return { success: false, message: error.message, data: null };
  }

  return { success: true, message: "Note fetched successfully", data: data as Note };
}

/* DELETE Note */
export async function deleteNote(id: number, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("notes").delete().eq("id", id).eq("created_by", userId);

  if (error) {
    console.error("Error deleting note:", error.message);
    return { success: false, message: error.message };
  }

  return { success: true, message: "Note deleted successfully" };
}

/* CREATE Note */
export async function createNote(note: Note) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("notes").insert(note as Note).select("*");

  if (error) {
    console.error("Error creating note:", error.message);
    return { success: false, message: error.message };
  }

  return { success: true, message: "Note created successfully", data: data[0] as Note };
}

/* UPDATE Note */
export async function updateNote(note: Note) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("notes").update(note as Note).eq("id", note.id).select("*");

  if (error) {
    console.error("Error updating note:", error.message);
    return { success: false, message: error.message };
  }

  return { success: true, message: "Note updated successfully", data: data[0] as Note };
}