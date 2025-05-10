"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  getFlashcardsSetById,
  deleteFlashcardsSet,
  updateFlashcardsSet,
  createFlashcardsSubmission,
} from "@/actions/flashcardsActions";
import { FlashcardsSet } from "@/types/flashcards";
import { useUserStore } from "@/stores/userStore";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { flashcardsSchema } from "@/schema/flashcards";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FlashcardsSubmission } from "@/types/flashcards";
import { uploadFileToFlashcardsBucket } from "@/actions/storageActions";
import FlashcardsCardsStack from "@/components/flashcards-cards-stack";

type CreateFlashcardsFormValues = z.infer<typeof flashcardsSchema>;

const FlashcardsPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const user = useUserStore((state) => state.user);
  const flashcardsId = Number(params.id);
  const [flashcardsSet, setFlashcardsSet] = useState<FlashcardsSet | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFlashcardsLoaded, setIsFlashcardsLoaded] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function fetchFlashcardsSetById() {
    try {
      const response = await getFlashcardsSetById(flashcardsId);
      console.log("response", response);

      if (response.success) {
        setFlashcardsSet(() => response.data);
      } else {
        toast.error(response.message || "Failed to fetch flashcards.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching flashcards.");
    }
  }

  // TODO: add fetchStarredFlashcards and utilize them

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    setValue: setValueEdit,
    getValues: getValuesEdit,
    control: controlEdit,
    formState: { errors: errorsEdit },
  } = useForm<CreateFlashcardsFormValues>({
    resolver: zodResolver(flashcardsSchema),
    defaultValues: {
      title: flashcardsSet?.title,
      description: flashcardsSet?.description,
      category: flashcardsSet?.category,
      visibility: flashcardsSet?.visibility,
      flashcards: [
        {
          id: 1,
          term: "",
          definition: "",
          image_url: undefined,
        },
      ],
    },
  });

  const handleImageUpload = async (
    cardIndex: number,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const userId = user?.id;
    const flashcards = getValuesEdit("flashcards");

    if (!userId || !flashcardsId || !flashcards[cardIndex]?.id) {
      toast.error("Invalid data for upload.");
      return;
    }

    try {
      const publicUrl = await uploadFileToFlashcardsBucket(
        file,
        userId,
        flashcardsId,
        flashcards[cardIndex].id
      );

      if (publicUrl) {
        setValueEdit(`flashcards.${cardIndex}.image_url`, publicUrl, {
          shouldValidate: true,
        });
        toast.success("Image uploaded successfully!");
      }
    } catch (error) {
      toast.error("Upload failed!");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFlashcardsSetById();
  }, [params]);

  useEffect(() => {
    if (flashcardsSet && !isFlashcardsLoaded) {
      // Set basic flashcard set details
      setValueEdit("title", flashcardsSet.title || "");
      setValueEdit("description", flashcardsSet.description || "");
      setValueEdit("category", flashcardsSet.category || "");
      setValueEdit("visibility", flashcardsSet.visibility || "everyone");

      // Set flashcards data
      if (flashcardsSet.flashcards && flashcardsSet.flashcards.length > 0) {
        setValueEdit(
          "flashcards",
          flashcardsSet.flashcards.map((card, index) => ({
            id: card.id ?? index + 1,
            term: card.term || "",
            definition: card.definition || "",
            image_url: card.image_url || undefined,
          }))
        );

        setIsFlashcardsLoaded(true);
      }
    }
  }, [flashcardsSet]);

  // 🔁 For editing an existing flashcard set
  const onSubmitEditFlashcards = async (data: CreateFlashcardsFormValues) => {
    if (!flashcardsSet) return;

    data.created_by = user?.id;
    data.id = flashcardsSet.id;

    console.log("Edited flashcard set data", data);

    const result = await updateFlashcardsSet(data);

    if (result?.success) {
      toast.success("Flashcards updated successfully!");
      await fetchFlashcardsSetById();
      setIsEditMode(false);
    } else {
      toast.error("Failed to update flashcards.");
    }
  };

  const onDeleteFlashcardsSet = async () => {
    if (!flashcardsSet) return;

    toast
      .promise(
        deleteFlashcardsSet(flashcardsSet.id as number, user?.id as string),
        {
          pending: "Deleting flashcards...",
          success: "Flashcards deleted successfully.",
          error: "Failed to delete flashcards.",
        }
      )
      .then((response) => {
        if (response.success) {
          router.push("/library");
        }
      });
  };

  const { fields, append, remove } = useFieldArray({
    control: controlEdit,
    name: "flashcards",
  });

  const addFlashcard = () => {
    const existing = getValuesEdit("flashcards") || [];

    const ids = existing
      .map((card) => card.id)
      .filter((id): id is number => id !== undefined);

    const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

    append({
      id: nextId,
      term: "",
      definition: "",
      image_url: undefined,
    });
  };

  const removeFlashcard = (index: number) => {
    remove(index);

    // Reassign IDs for consistency
    setTimeout(() => {
      const updated = getValuesEdit("flashcards");
      updated.forEach((_, i: number) => {
        setValueEdit(`flashcards.${i}.id`, i + 1);
      });
    }, 0);
  };

  return (
    <div className="mx-4 mb-20 mt-6 md:mt-6">
      {user?.id === flashcardsSet?.created_by && (
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-row justify-end space-x-2">
            {!isEditMode ? (
              <Button onClick={() => setIsEditMode(true)} variant="outline">
                Edit flashcards
              </Button>
            ) : (
              <Button onClick={() => setIsEditMode(false)} variant="outline">
                Cancel
              </Button>
            )}
            <Button onClick={onDeleteFlashcardsSet} variant="destructive">
              Delete Set
            </Button>
          </div>
        </div>
      )}

      {isEditMode && (
        <div className="flex justify-center text-lg text-green-500 mb-2">
          Edit mode
        </div>
      )}

      {!isEditMode ? (
        <div className="flex flex-col justify-center max-w-4xl mx-auto">
          <div className="flex flex-row justify-between items-center my-8">
            <div>
              <h2 className="text-lg md:text-2xl font-bold">
                {flashcardsSet?.title}
              </h2>
              <p className="text-sm md:text-lg">{flashcardsSet?.description}</p>
            </div>
            <div>
              <h4 className="text-sm md:text-md font-bold">
                Created{" "}
                {flashcardsSet?.created_at
                  ? new Date(flashcardsSet.created_at).toLocaleDateString(
                      "sk-SK",
                      {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      }
                    )
                  : "Invalid date"}
              </h4>
              <p>
                by{" "}
                <Link
                  href={`/profile/${user?.username}`}
                  className="hover:cursor-pointer hover:opacity-75"
                >
                  {user?.id === flashcardsSet?.created_by
                    ? user?.username
                    : "some nickname"}
                </Link>
              </p>
            </div>
          </div>

          {flashcardsSet && (
            <FlashcardsCardsStack flashcardsSet={flashcardsSet} />
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmitEdit(onSubmitEditFlashcards)}
          className="flex flex-col justify-center max-w-4xl mx-auto border border-green-400 p-4 rounded-lg"
        >
          {/* Edit title & description */}
          <div className="dark:bg-muted border rounded-md p-6 space-y-4 bg-gray-100">
            <div className="space-y-2 pb-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter flashcard set title"
                {...registerEdit("title")}
              />
              {typeof errors.title?.message === "string" && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add a description..."
                {...registerEdit("description")}
              />
              {typeof errors.description?.message === "string" && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex flex-row">
              <div className="flex items-center gap-3 w-1/2">
                <Label htmlFor="title">Visible to</Label>
                <Select
                  onValueChange={(value) => setValueEdit("visibility", value)}
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
                  {...registerEdit("category")}
                />
                {errors.category &&
                  typeof errors.category.message === "string" && (
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
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-col dark:bg-muted border rounded-md p-6 space-y-4"
              >
                <div className="space-y-2">
                  <Label>Term {index + 1}</Label>
                  <Textarea
                    placeholder="Enter the term"
                    {...registerEdit(`flashcards.${index}.term`)}
                  />
                </div>

                <div key={field.id} className="py-2 space-y-2">
                  <Label>Image (optional)</Label>
                  <Input
                    type="file"
                    className="border bg-gray-50 cursor-pointer dark:bg-neutral-900 dark:border-neutral-700"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, e.target.files)}
                  />
                  {getValuesEdit(`flashcards.${index}.image_url`) && (
                    <img
                      src={getValuesEdit(`flashcards.${index}.image_url`) || ""}
                      alt="Uploaded"
                      className="mt-2 w-full h-96 object-cover border"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Definition</Label>
                  <Textarea
                    placeholder="Enter the definition"
                    {...registerEdit(`flashcards.${index}.definition`)}
                  />
                </div>

                <Button
                  variant="destructive"
                  className="bg-red-500 w-36 self-end"
                  onClick={() => removeFlashcard(index)}
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
              variant="outline"
              type="submit"
              className="bg-green-100 border-green-500 hover:bg-green-200 dark:bg-green-400 dark:text-black"
            >
              Save changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FlashcardsPage;
