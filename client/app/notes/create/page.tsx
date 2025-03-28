"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createNote } from "@/actions/notesActions";
import { useUserStore } from "@/stores/userStore";
import { noteSchema } from "@/schema/note";

type NoteFormInputs = z.infer<typeof noteSchema>;

export default function CreateNotes() {
  const params = useSearchParams();
  const option = params.get("option");
  const user = useUserStore((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NoteFormInputs>({
    resolver: zodResolver(noteSchema),
  });

  const onSubmit = async (data: NoteFormInputs) => {
    try {
      const res = await createNote({
        ...data,
        created_at: new Date().toISOString(),
        created_by: user?.id ?? "",
      });
      if (res.success) {
        toast.success(res.message);
        reset();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Error creating note");
    }
  };

  return (
    <div>
      <div className="flex flex-row justify-center my-8">
        <h2 className="text-2xl font-bold">
          Create a note {option == "withAI" ? "with AI" : "manually"}
        </h2>
      </div>
      <div className="flex flex-col justify-center max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-red-200 border rounded-md p-4 space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="note-title">Note Title</Label>
            <Input
              id="note-title"
              type="text"
              placeholder="Enter a title, like Introduction to AI"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-content">Content</Label>
            <Input
              id="note-content"
              type="text"
              placeholder="Enter content for the note..."
              {...register("content")}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit">Create Note</Button>
          </div>
        </form>
      </div>
    </div>
  );
}