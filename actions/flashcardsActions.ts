"use server";

import { createClient } from "@/utils/supabase/server";
import { FlashcardsSet, FlashcardsSubmission } from "@/types/flashcards";

/* GET Flashcards Sets */
export async function getFlashcardsSets() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("flashcards").select(`*`);

  if (error) {
    console.error("Error fetching flashcards sets:", error.message);
    return { success: false, message: error.message, data: [] };
  } else {
    return {
      success: true,
      message: "Flashcards sets successfully fetched",
      data,
    };
  }
}

/* GET Flashcards Set by ID */
export async function getFlashcardsSetById(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcards")
    .select(`*`)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching flashcards set by ID:", error.message);
    return { success: false, message: error.message, data: null };
  }

  return {
    success: true,
    message: "Flashcards set fetched successfully",
    data,
  };
}

/* GET Flashcards Sets by User ID */
export async function getFlashcardsSetsByUserId(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcards")
    .select(`*`)
    .eq("created_by", userId);

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return {
    success: true,
    message: "Flashcards sets by user ID fetched",
    data,
  };
}

/* CREATE Flashcards Set */
export async function createFlashcards(flashcards: FlashcardsSet) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcards")
    .insert([flashcards])
    .select("id")
    .single();

  if (error) {
    console.error("Error creating flashcards set:", error.message);
    return { success: false, message: error.message, flashcardsId: null };
  }

  return {
    success: true,
    message: "Flashcards set created",
    flashcardsId: data?.id || null,
  };
}

/* UPDATE Flashcards Set */
export async function updateFlashcardsSet(flashcards: FlashcardsSet) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcards")
    .update(flashcards)
    .eq("id", flashcards.id);

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return {
    success: true,
    message: "Flashcards set updated",
    data,
  };
}

/* DELETE Flashcards Set */
export async function deleteFlashcardsSet(
  flashcardsId: number,
  userId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("flashcards")
    .delete()
    .eq("id", flashcardsId)
    .eq("created_by", userId);

  if (error) {
    console.error("Error deleting flashcards set:", error.message);
    return { success: false, message: error.message };
  }

  return { success: true, message: "Flashcards set deleted" };
}

/* FLASHCARDS starred */

/* POST insert starred flashcards to table flashcards-starred */
/* Table looks like this:
 * id , flashcards_id, created_at, created_by, flashcards_starred,
 * flashcards_starred is jsonb that cound store question id and starred option true/false
 * */
export async function insertOrUpdateStarredFlashcards(
  flashcardsId: number,
  userId: string,
  starredFlashcards: any
) {
  const supabase = await createClient();

  try {
    // Fetch existing entry
    const { data: existingEntry, error: fetchError } = await supabase
      .from("flashcards-starred")
      .select("id")
      .eq("flashcards_id", flashcardsId)
      .eq("created_by", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // If the error is not "Row not found", log it and return
      console.error("Error fetching starred flashcards:", fetchError.message);
      return { success: false, message: fetchError.message };
    }

    let data, error;

    if (existingEntry) {
      // Update existing entry
      ({ data, error } = await supabase
        .from("flashcards-starred")
        .update({
          flashcards_starred: starredFlashcards,
        })
        .eq("id", existingEntry.id)
        .select("id")
        .single());
    } else {
      // Insert new entry
      ({ data, error } = await supabase
        .from("flashcards-starred")
        .insert([
          {
            flashcards_id: flashcardsId,
            created_by: userId,
            flashcards_starred: starredFlashcards,
          },
        ])
        .select("id")
        .single());
    }

    if (error) {
      console.error(
        "Error inserting/updating starred flashcards:",
        error.message
      );
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: existingEntry
        ? "Starred flashcards updated"
        : "Starred flashcards inserted",
      data,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, message: "Unexpected error occurred" };
  }
}

/* GET starred flashcards by flashcards set id*/
export async function getStarredFlashcardsBySetId(
  flashcardsId: number,
  userId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcards-starred")
    .select("*")
    .eq("flashcards_id", flashcardsId)
    .eq("created_by", userId)
    .single();

  if (error) {
    console.error("Error fetching starred flashcards:", error.message);
    return { success: false, message: error.message, data: null };
  }

  return {
    success: true,
    message: "Starred flashcards fetched",
    data,
  };
}
