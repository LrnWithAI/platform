"use client";

import { createClient } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import { getClasses } from "./classActions";

/* GET User avatar */
export async function downloadImage(path: string) {
  const supabase = createClient();

  if (path !== null && path !== "") {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);
      if (error) {
        throw error;
      }

      const url = URL.createObjectURL(data);
      return {
        success: true,
        message: "user url downloaded successfully",
        data: url,
      };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  } else {
    return { success: false, message: "No image path provided" };
  }
}

/* CLASS */
/* POST File (img) into class_files bucket as class cover image*/
export async function uploadFileToClassCoverPhoto(
  file: File,
  userId: string,
  classId: number
) {
  const supabase = createClient();

  const filePath = `private/${userId}/${classId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from("class_files")
    .upload(filePath, file);

  if (error) {
    toast.error("Failed to upload image");
    console.error("Failed to upload file", error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("class_files")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/* DELETE File from class_files bucket */
export async function deleteFileFromClassCoverPhoto(
  imageName: string,
  userId: string,
  classId: number
) {
  const supabase = createClient();

  const filePath = `private/${userId}/${classId}/${imageName}`;
  const { error } = await supabase.storage
    .from("class_files")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting file", error);
    return { success: false, message: (error as Error).message };
  }

  return { success: true, message: "File deleted successfully!" };
}

/* POST files into class_files bucket as post files */
export async function uploadFilesToClassContent(
  files: File[] | null,
  userId: string,
  classId: number,
  postId: number
) {
  if (!files || files.length === 0) return [];

  const supabase = createClient();

  const uploadedFiles = await Promise.all(
    Array.from(files).map(async (file) => {
      const filePath = `private/${userId}/${classId}/${postId}/${file.name}`; // Must match RLS policy
      const { data, error } = await supabase.storage
        .from("class_files")
        .upload(filePath, file);

      if (error) {
        toast.error(`Failed to upload ${file.name}`);
        console.error("Failed to upload file", error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from("class_files")
        .getPublicUrl(filePath);

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
export async function updateClassContent(
  classId: number,
  postId: number,
  files: any[],
  user_id: string
) {
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

  // Odstránime duplikáty
  files = files.filter(
    (file, index, self) => self.findIndex((f) => f.id === file.id) === index
  );

  // Nájdeme príspevok a pridáme do neho už existujúce aj nové súbory
  const updatedContent = classData.content.map((post: any) =>
    post.id === postId ? { ...post, files: files } : post
  );

  // Aktualizujeme `class` tabuľku s novým obsahom
  const { error: updateError } = await supabase
    .from("class")
    .update({ content: updatedContent })
    .eq("id", classId);

  if (updateError) {
    return { success: false, message: (updateError as Error).message };
  } else {
    const res = await getClasses(user_id);
    return {
      success: true,
      message: "Files uploaded and saved successfully!",
      data: res.data,
    };
  }
}

/* DELETE File from class_files bucket for class post */
export async function deleteFileFromClassContent(
  userId: string,
  classId: number,
  postId: number,
  fileName: string,
  user_id: string
) {
  const supabase = createClient();

  const filePath = `private/${userId}/${classId}/${postId}/${fileName}`;
  const { error } = await supabase.storage
    .from("class_files")
    .remove([filePath]);

  if (error) {
    return { success: false, message: (error as Error).message };
  } else {
    const res = await getClasses(user_id);
    return {
      success: true,
      message: `File ${fileName} deleted successfully!`,
      data: res.data,
    };
  }
}

/* USER */
/* POST File into user bucket */
export async function uploadFileToUser(file: File, userId: string) {
  const supabase = createClient();

  const filePath = `private/${userId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from("user-files")
    .upload(filePath, file);

  if (error) {
    toast.error("Failed to upload image");
    console.error("Failed to upload file", error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("user-files")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/* DELETE File from user bucket */
export async function deleteFileFromUser(imageName: string, userId: string) {
  const supabase = createClient();

  const filePath = `private/${userId}/${imageName}`;
  const { error } = await supabase.storage
    .from("user-files")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting file", error);
    return { success: false, message: (error as Error).message };
  }

  return { success: true, message: "File deleted successfully!" };
}

/* TESTS */
/* POST File into tests bucket */
export async function uploadFileToTestFilesBucket(
  file: File,
  userId: string,
  testId?: number
) {
  const supabase = createClient();

  const filePath = `/${userId}/${testId}/pdf/${file.name}`;
  const { data, error } = await supabase.storage
    .from("test-files")
    .upload(filePath, file);

  if (error) {
    toast.error("Failed to upload file");
    console.error("Failed to upload file", error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("test-files")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/* TEST Questions */
/* POST File into tests bucket as image for each question */
export async function uploadFileToTestQuestionsBucket(
  file: File,
  userId: string,
  testId: number,
  questionId: number
) {
  const supabase = createClient();

  const filePath = `/${userId}/${testId}/questions/${questionId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from("test-files")
    .upload(filePath, file);

  if (error) {
    toast.error("Failed to upload file");
    console.error("Failed to upload file", error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("test-files")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/* FLASHCARDS */
/* POST File into flashcards bucket */
export async function uploadFileToFlashcardsBucket(
  file: File,
  userId: string,
  flashcardsId: number,
  cardId: number
) {
  const supabase = createClient();

  const filePath = `/${userId}/${flashcardsId}/flashcards/${cardId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from("flashcards-files")
    .upload(filePath, file);

  if (error) {
    toast.error("Failed to upload file");
    console.error("Failed to upload file", error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("flashcards-files")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function uploadFileToFlashcardsFilesBucket(
  file: File,
  userId: string,
  flashcardsId: number,
  cardId?: number
) {
  const supabase = createClient();

  const filePath = `/${userId}/${flashcardsId}/pdf/${file.name}`;
  const { data, error } = await supabase.storage
    .from("flashcards-files")
    .upload(filePath, file);

  if (error) {
    toast.error("Failed to upload file");
    console.error("Failed to upload file", error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("flashcards-files")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/* NOTES */
export async function uploadFileToNotesBucket(
  file: File,
  userId: string,
  noteId: number
) {
  const supabase = createClient();

  const filePath = `/${userId}/${noteId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from("notes-files")
    .upload(filePath, file);

  if (error) {
    toast.error("Failed to upload file");
    console.error("Failed to upload file", error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("notes-files")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function deleteFileFromNotesBucket(
  fileName: string,
  userId: string,
  noteId: number
) {
  const supabase = createClient();

  const filePath = `${userId}/${noteId}/${fileName}`;
  const { error } = await supabase.storage
    .from("notes-files")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting file", error);
    return { success: false, message: (error as Error).message };
  }

  return { success: true, message: "File deleted successfully!" };
}

export async function uploadAiFileToNotesBucket(
  file: File,
  userId: string,
  noteId: number
) {
  const supabase = createClient();

  const filePath = `/${userId}/${noteId}/ai/${file.name}`;
  const { data, error } = await supabase.storage
    .from("notes-files")
    .upload(filePath, file);

  if (error) {
    toast.error("Failed to upload AI file");
    console.error("Failed to upload AI file", error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("notes-files")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}