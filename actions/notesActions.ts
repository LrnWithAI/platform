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

  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("created_by->>id", userId); // ← filterujeme podľa id v JSON

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

/* GET Latest created notes */
export async function getLatestPublicNotes(limit = 4) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return { success: true, message: "Latest public notes fetched", data };
}

/* GET Notes top creators */
export async function getTopNoteCreators(limit = 4) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("created_by")
    .neq("created_by", null);

  if (error || !data) {
    return { success: false, message: error?.message || "No data", data: [] };
  }

  // Count notes by user
  const creatorMap: { [key: string]: { user: any; count: number } } = {};

  data.forEach((note: any) => {
    const user = note.created_by;
    const id = user.id;
    if (!creatorMap[id]) {
      creatorMap[id] = { user, count: 1 };
    } else {
      creatorMap[id].count++;
    }
  });

  const sorted = Object.values(creatorMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return { success: true, data: sorted };
}