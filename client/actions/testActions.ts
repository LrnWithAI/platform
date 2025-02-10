"use server";

import { createClient } from "@/utils/supabase/server";
import { Test } from "@/types/test";

/* GET Tests */
export async function getTests() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("tests").select(`*`);

  if (error) {
    console.error("Error fetching tests:", error.message);
    return { success: false, message: error.message, data: [] };
  } else {
    return {
      success: true,
      message: "Tests successfully fetched",
      data: data,
    };
  }
}

/* GET Test by id */
export async function getTestById(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("tests").select(`*`).eq("id", id);

  if (error) {
    console.error("Error fetching test by id:", error.message);
    return { success: false, message: error.message, data: [] };
  } else {
    return {
      success: true,
      message: "Test by id successfully fetched",
      data: data,
    };
  }
}

/* GET Tests by user id */
export async function getTestsByUserId(userId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tests")
    .select(`*`)
    .eq("created_by", userId);

  if (error) {
    console.error("Error fetching tests by user id:", error.message);
    return { success: false, message: error.message, data: [] };
  } else {
    return {
      success: true,
      message: "Tests by user id successfully fetched",
      data: data,
    };
  }
}

/* DELETE Test */
export async function deleteTest(id: number) {
  const supabase = await createClient();

  const { error } = await supabase.from("tests").delete().eq("id", id);

  if (error) {
    console.error("Error deleting test:", error.message);
    return { success: false, message: error.message };
  } else {
    return { success: true, message: "Test successfully deleted" };
  }
}

/* CREATE Test */
export async function createTest(test: Test) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("tests").insert([test]);

  if (error) {
    console.error("Error creating test:", error.message);
    return { success: false, message: error.message, data: [] };
  } else {
    return {
      success: true,
      message: "Test successfully created",
      data: data,
    };
  }
}
