"use server";

import { createClient } from "@/utils/supabase/server";

/* Get Classes */
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