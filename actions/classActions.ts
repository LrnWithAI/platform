"use server";

import { createClient } from "@/utils/supabase/server";

/* GET Classes */
export async function getClasses(user_id: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("class")
      .select("*")
      .contains("members", JSON.stringify([{ id: user_id }]));

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
    const { data, error } = await supabase
      .from("class")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);

    return { success: true, message: "Class fetched successfully", data };
  } catch (error) {
    console.error("Error fetching class by ID:", error);
    return { success: false, message: (error as Error).message, data: {} };
  }
}

/* POST Class */
export async function createClass(data: any) {
  const supabase = await createClient();

  try {
    const { data: result, error } = await supabase
      .from("class")
      .insert([data])
      .select("*");

    if (error) throw new Error(error.message);

    return {
      success: true,
      message: "Class created successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error creating class:", error);
    return { success: false, message: (error as Error).message };
  }
}

/* PUT Class */
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

/* Add student to class */
export async function addStudentToClass(classId: number, user: object) {
  const supabase = await createClient();

  const { data: classData, error } = await supabase
    .from("class")
    .select("members")
    .eq("id", classId)
    .single();

  if (error) throw new Error(error.message);

  const updatedMembers = [...(classData?.members || []), user];

  const { error: updateError } = await supabase
    .from("class")
    .update({ members: updatedMembers })
    .eq("id", classId);

  if (updateError) throw new Error(updateError.message);
}

export async function getClassWithMostMembers() {
  const supabase = await createClient();

  try {
    // Step 1: Fetch all classes
    const { data: classes, error } = await supabase.from("class").select("*");

    if (error || !classes) {
      throw new Error(error?.message || "Failed to fetch classes");
    }

    // Step 2: Count members
    const sortedByMembers = classes
      .map((cls) => ({
        ...cls,
        memberCount: Array.isArray(cls.members) ? cls.members.length : 0,
      }))
      .sort((a, b) => b.memberCount - a.memberCount);

    const mostPopular = sortedByMembers[0];

    if (!mostPopular) {
      return { success: false, message: "No classes found", data: null };
    }

    return {
      success: true,
      message: "Most popular class fetched successfully",
      data: mostPopular,
    };
  } catch (error) {
    console.error("Error fetching class with most members:", error);
    return {
      success: false,
      message: (error as Error).message,
      data: null,
    };
  }
}
