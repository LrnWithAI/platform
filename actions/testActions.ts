"use server";

import { createClient } from "@/utils/supabase/server";
import { Test, TestSubmission } from "@/types/test";

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
export async function getTestsByUserId(userId: string) {
  const supabase = await createClient();
  //console.log("userId:", userId);

  const { data, error } = await supabase
    .from("tests")
    .select(`*`)
    .eq("created_by", userId);

  //console.log("Supabase response:", { data, error });

  if (error) {
    //console.error("Error fetching tests by user id:", error.message);
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
export async function deleteTest(testId: number, userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tests")
    .delete()
    .eq("id", testId)
    .eq("created_by", userId);

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

  const { data, error } = await supabase
    .from("tests")
    .insert([test])
    .select("id")
    .single();

  if (error) {
    console.error("Error creating test:", error.message);
    return { success: false, message: error.message, testId: null };
  }

  return {
    success: true,
    message: "Test successfully created",
    testId: data?.id || null,
  };
}

/* UPDATE Test */
export async function updateTest(test: Test) {
  const supabase = await createClient();

  console.log("test:", test);

  const { data, error } = await supabase
    .from("tests")
    .update(test)
    .eq("id", test.id);

  if (error) {
    console.error("Error updating test:", error.message);
    return { success: false, message: error.message, data: [] };
  } else {
    return {
      success: true,
      message: "Test successfully updated",
      data: data,
    };
  }
}

/* --- TEST SUBMISSIONS --- */

/* GET Test Submissions by Test ID */
export async function getTestSubmissionsByTestId(testId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("test-submissions")
    .select(`*`)
    .eq("test_id", testId);

  if (error) {
    console.error("Error fetching test submissions:", error.message);
    return { success: false, message: error.message, data: [] };
  } else {
    return {
      success: true,
      message: "Test submissions successfully fetched",
      data: data,
    };
  }
}

/* CREATE Test Submission */
export async function createTestSubmission(testSubmission: TestSubmission) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("test-submissions")
    .insert([testSubmission])
    .select("id")
    .single();

  if (error) {
    console.error("Error creating test submission:", error.message);
    return { success: false, message: error.message, testSubmissionId: null };
  }

  return {
    success: true,
    message: "Test submission successfully created",
    testSubmissionId: data?.id || null,
  };
}

/* GET Test Submission by ID */
export async function getTestSubmissionById(submissionId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("test-submissions")
    .select("*") // Select all columns
    .eq("id", submissionId) // Match by submission ID
    .single(); // Expect only one row

  console.log("Supabase response:", { data, error });

  if (error) {
    console.error("Error fetching test submission:", error.message);
    return null;
  }

  return {
    success: true,
    message: "Test submission successfully fetched",
    data: data,
  };
}

/* GET Test submission by user id*/
export async function getTestSubmissionsByUserId(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("test-submissions")
    .select(`*`)
    .eq("user_id", userId);

  console.log("Supabase response:", { data, error });

  if (error) {
    console.error("Error fetching test submissions by user id:", error.message);
    return { success: false, message: error.message, data: [] };
  } else {
    return {
      success: true,
      message: "Test submissions by user id successfully fetched",
      data: data,
    };
  }
}

/* GET Most submitted test */
export async function getTopSubmittedTests(limit = 3) {
  const supabase = await createClient();

  // Step 1: Get all submissions
  const { data: submissions, error } = await supabase
    .from("test-submissions")
    .select("test_id");

  if (error || !submissions) {
    console.error("Error fetching submissions:", error?.message);
    return {
      success: false,
      message: "Could not fetch submissions",
      data: [],
    };
  }

  // Step 2: Count occurrences
  const countMap: Record<number, number> = {};

  for (const sub of submissions) {
    const testId = sub.test_id;
    if (testId in countMap) {
      countMap[testId]++;
    } else {
      countMap[testId] = 1;
    }
  }

  // Step 3: Sort by most submissions and get top N ids
  const topTestIds = Object.entries(countMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => Number(id));

  if (topTestIds.length === 0) {
    return {
      success: false,
      message: "No top tests found",
      data: [],
    };
  }

  // Step 4: Fetch all corresponding tests
  const { data: tests, error: fetchError } = await supabase
    .from("tests")
    .select("*")
    .in("id", topTestIds);

  if (fetchError || !tests) {
    return {
      success: false,
      message: fetchError?.message || "Failed to fetch tests",
      data: [],
    };
  }

  // Optional: Zoradiť podľa pôvodného poradia topTestIds
  const sortedTests = topTestIds.map((id) => tests.find((t) => t.id === id)).filter(Boolean);

  return {
    success: true,
    message: "Top submitted tests fetched",
    data: sortedTests,
  };
}