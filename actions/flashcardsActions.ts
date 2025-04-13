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
    .single();

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

/* --- FLASHCARDS SUBMISSIONS --- */

/* GET Submissions by Flashcards Set ID */
export async function getFlashcardsSubmissionsBySetId(flashcardsId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcards-submissions")
    .select(`*`)
    .eq("flashcards_id", flashcardsId);

  if (error) {
    console.error("Error fetching flashcards submissions:", error.message);
    return { success: false, message: error.message, data: [] };
  }

  return {
    success: true,
    message: "Flashcards submissions fetched",
    data,
  };
}

/* CREATE Flashcards Submission */
export async function createFlashcardsSubmission(
  submission: FlashcardsSubmission
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcards-submissions")
    .insert([submission])
    .select("id")
    .single();

  if (error) {
    console.error("Error creating flashcards submission:", error.message);
    return { success: false, message: error.message, submissionId: null };
  }

  return {
    success: true,
    message: "Flashcards submission created",
    submissionId: data?.id || null,
  };
}

/* GET Flashcards Submission by ID */
export async function getFlashcardsSubmissionById(submissionId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcards-submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (error) {
    console.error("Error fetching flashcards submission:", error.message);
    return null;
  }

  return {
    success: true,
    message: "Flashcards submission fetched",
    data,
  };
}

/* GET Submissions by User ID */
export async function getFlashcardsSubmissionsByUserId(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flashcards-submissions")
    .select(`*`)
    .eq("user_id", userId);

  if (error) {
    console.error(
      "Error fetching flashcards submissions by user ID:",
      error.message
    );
    return { success: false, message: error.message, data: [] };
  }

  return {
    success: true,
    message: "User's flashcards submissions fetched",
    data,
  };
}
