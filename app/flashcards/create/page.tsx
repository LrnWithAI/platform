"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { flashcardsSchema } from "@/schema/flashcards";
import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import CreateTestWithAIForm from "@/components/test-create-with-ai";

import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

import { createFlashcards } from "@/actions/flashcardsActions";
import { useUserStore } from "@/stores/userStore";

type CreateFlashcardsFormValues = z.infer<typeof flashcardsSchema>;

export default function CreateFlashcards() {
  const params = useSearchParams();
  const { user } = useUserStore();
  const option = params.get("option");

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<CreateFlashcardsFormValues>({
    resolver: zodResolver(flashcardsSchema),
    defaultValues: {
      visibility: "everyone",
      flashcards: [
        {
          id: 1,
          term: "",
          definition: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "flashcards",
  });

  const addFlashcard = () => {
    const existing = getValues("flashcards") || [];

    const ids = existing
      .map((card) => card.id)
      .filter((id): id is number => id !== undefined);

    const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

    append({
      id: nextId,
      term: "",
      definition: "",
    });
  };

  const removeFlashcard = (index: number) => {
    remove(index);

    setTimeout(() => {
      const updated = getValues("flashcards");
      updated.forEach((_, i: number) => {
        setValue(`flashcards.${i}.id`, i + 1);
      });
    }, 0);
  };

  const onSubmit = async (data: CreateFlashcardsFormValues) => {
    console.log("Submitted data", data);
    data.created_by = user?.id;

    const result = await createFlashcards(data);
    toast.success("Flashcards created successfully!");
    router.push(`/flashcards/${result?.flashcardsId}`);
  };

  return (
    <div className="mx-4 mb-20">
      <div className="flex flex-row justify-center my-8">
        <h2 className="text-2xl font-bold">
          Create a new flashcards set{" "}
          {option == "withAI" ? "with AI" : "manually"}
        </h2>
      </div>

      {option === "manually" ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-center max-w-4xl mx-auto"
        >
          <div className="dark:bg-muted border rounded-md p-6 space-y-4 bg-gray-100">
            <div className="space-y-2 pb-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter a title, like Introduction to AI"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                placeholder="Add a description..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex flex-row">
              <div className="flex items-center gap-3 w-1/2">
                <Label htmlFor="visibility">Visible to</Label>
                <Select
                  onValueChange={(value) => setValue("visibility", value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Everyone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="users-with-password">
                        Users with password
                      </SelectItem>
                      <SelectItem value="just-me">Just me</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center w-1/2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  type="text"
                  placeholder="AI"
                  {...register("category")}
                />
                {errors.category && (
                  <p className="text-sm text-red-500">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="my-4">
            <h2 className="text-xl font-bold">Flashcards</h2>
          </div>

          <div className="space-y-6">
            {fields.map((field, cardIndex) => (
              <div
                key={field.id}
                className="flex flex-col dark:bg-muted border rounded-md p-6 space-y-4"
              >
                <div className="space-y-2">
                  <Label>Term {cardIndex + 1}</Label>
                  <Textarea
                    placeholder="Enter the term"
                    {...register(`flashcards.${cardIndex}.term`)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Definition</Label>
                  <Textarea
                    placeholder="Enter the definition"
                    {...register(`flashcards.${cardIndex}.definition`)}
                  />
                </div>

                <Button
                  variant="destructive"
                  className="bg-red-500 w-36 self-end"
                  onClick={() => removeFlashcard(cardIndex)}
                  type="button"
                >
                  Remove flashcard
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-center my-6">
            <Button variant="outline" onClick={addFlashcard} type="button">
              Add Flashcard
            </Button>
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              className="bg-purple hover:bg-purple-500 dark:text-white"
            >
              Create Flashcard Set
            </Button>
          </div>
        </form>
      ) : option === "withAI" ? (
        <CreateTestWithAIForm />
      ) : (
        <p>Bad option provided</p>
      )}
    </div>
  );
}
