"use server";

import { createClient } from "@/utils/supabase/server";
import { Report } from "@/types/report";

/* POST Report */
export async function createReport(data: Report) {
  const supabase = await createClient();

  try {
    const { data: result, error } = await supabase.from("report").insert([data]).select("*");

    if (error) throw new Error(error.message);

    return { success: true, message: "Report sent successfully", data: result };
  } catch (error) {
    console.error("Error sending report:", error);
    return { success: false, message: (error as Error).message };
  }
}
