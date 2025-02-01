"use client";

import { createClient } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import { getClasses } from "./classActions";

/* GET User avatar */
export async function downloadImage(path: string) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.storage
      .from("avatars")
      .download(path);
    if (error) {
      throw error;
    }

    const url = URL.createObjectURL(data);
    return { success: true, message: "user url downloaded successfully", data: url };
  } catch (error) {
    console.log("Error downloading image: ", error);
    return { success: false, message: (error as Error).message };
  }
}

/* POST Files into Supabase Storage class_files bucket */
export async function uploadFilesToStorage(files: FileList | null, userId: string, classId: number, postId: number) {
  if (!files || files.length === 0) return [];

  const supabase = createClient();

  const uploadedFiles = await Promise.all(
    Array.from(files).map(async (file) => {
      const filePath = `private/${userId}/${classId}/${postId}/${file.name}`;   // Must match RLS policy
      const { data, error } = await supabase.storage.from("class_files").upload(filePath, file);

      if (error) {
        toast.error(`Failed to upload ${file.name}`);
        console.error("Failed to upload file", error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage.from("class_files").getPublicUrl(filePath);

      return {
        id: crypto.randomUUID(), // Lokálny identifikátor
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrlData.publicUrl,
      };
    })
  );

  return uploadedFiles.filter((file) => file !== null);
}

/* UPDATE `files` array in `class.content` in class table */
export async function updateClassFiles(classId: number, postId: number, newFiles: any[]) {
  const supabase = createClient();

  const { data: classData, error: fetchError } = await supabase
    .from("class")
    .select("content")
    .eq("id", classId)
    .single();

  if (fetchError) {
    toast.error("Failed to fetch class data");
    return;
  }

  // Nájdeme príspevok a pridáme do neho nové súbory
  const updatedContent = classData.content.map((post: any) =>
    post.id === postId ? { ...post, files: [...(post.files || []), ...newFiles] } : post
  );

  // Aktualizujeme `class` tabuľku s novým obsahom
  const { error: updateError } = await supabase
    .from("class")
    .update({ content: updatedContent })
    .eq("id", classId);

  if (updateError) {
    return { success: false, message: (updateError as Error).message };
  } else {
    const res = await getClasses();
    return { success: true, message: "Files uploaded and saved successfully!", data: res.data };
  }
}