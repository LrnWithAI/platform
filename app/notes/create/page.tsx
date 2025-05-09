"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createNote, updateNote } from "@/actions/notesActions";
import { noteSchema } from "@/schema/note";
import { uploadFileToNotesBucket } from "@/actions/storageActions";
import { useUserStore } from "@/stores/userStore";
import { useLoadingStore } from "@/stores/loadingStore";

// Typ pre existujúci uploadnutý súbor
type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

type NoteFormInputs = z.infer<typeof noteSchema>;

export default function CreateNotes() {
  const params = useSearchParams();
  const option = params.get("option");
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const loading = useLoadingStore((state) => state.loading);
  const setLoading = useLoadingStore((state) => state.setLoading);

  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NoteFormInputs>({
    resolver: zodResolver(noteSchema),
  });

  const onSubmit = async (data: NoteFormInputs) => {
    setLoading(true);

    const notePayload = {
      ...data,
      created_at: new Date().toISOString(),
      created_by: {
        id: String(user?.id || 0),
        name: user?.full_name || "",
        role: user?.role || "",
        email: user?.email || "",
      },
      files: [{}] as [{ id: string; name: string; size: number; type: string; url: string }],
    };

    // 1. Najskôr poznámku bez files, dostaneš noteId
    const res = await createNote(notePayload);
    if (!res.success || !res.data?.id) {
      toast.error(res.message || "Failed to create note.");
      setLoading(false);
      return;
    }
    const noteId = res.data.id;

    // 2. Upload nových súborov
    let uploadedFiles: UploadedFile[] = [];
    try {
      for (const file of files) {
        if (!user) {
          toast.error("User information is missing.");
          setLoading(false);
          return;
        }

        const publicUrl = await uploadFileToNotesBucket(file, user.id, noteId);
        if (publicUrl) {
          uploadedFiles.push({
            id: file.name + file.lastModified,
            name: file.name,
            size: file.size,
            type: file.type,
            url: publicUrl,
          });
        }
      }
    } catch (err) {
      toast.error("File upload failed.");
    }

    // 3. Update poznámky s finálnymi files
    await updateNote({ id: noteId, ...notePayload, files: uploadedFiles });

    toast.success("Note created successfully!");
    reset();
    setFiles([]);
    router.push(`/notes/${noteId}`);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center min-h-[60vh] justify-center py-10 mx-4 mb-20">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-2">
          Create a note {option == "withAI" ? "with AI" : "manually"}
        </h2>
        <p className="text-muted-foreground text-center mb-4">
          Notes allow you to keep important information in one place and access it anytime. Use them for revision, sharing tips or creating your own overviews.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-sidebar border rounded-xl p-8 space-y-6 shadow-md w-full max-w-5xl"
      >
        <div className="space-y-2">
          <Label htmlFor="note-title">Title</Label>
          <Input
            id="note-title"
            type="text"
            placeholder="Enter a title, e.g. Introduction to AI"
            {...register("title")}
            disabled={loading}
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="note-content">Content</Label>
          <textarea
            id="note-content"
            placeholder="Write your note here..."
            className="border rounded-lg p-2 w-full min-h-[120px] resize-y"
            {...register("content")}
            disabled={loading}
          />
          {errors.content && (
            <p className="text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="note-file">Attachments</Label>
          <Input
            id="note-file"
            type="file"
            multiple
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files || []);
              setFiles((prev) => [...prev, ...selectedFiles]);
            }}
            disabled={loading}
          />
          {files.length > 0 && (
            <div>
              <h3 className="mb-1 mt-2">Files to Upload</h3>
              <ul className="mt-2 space-y-2">
                {files.map((file) => (
                  <li key={file.name + file.lastModified} className="flex items-center justify-between border p-2 rounded-lg bg-white dark:bg-black">
                    <span className="truncate">{file.name}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setFiles((prev) =>
                          prev.filter((f) =>
                            f.name + f.lastModified !== file.name + file.lastModified
                          )
                        );
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Note"}
          </Button>
        </div>
      </form>
    </div>
  );
}