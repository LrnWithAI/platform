"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

import {
  createFlashcards,
  updateFlashcardsSet,
} from "@/actions/flashcardsActions";
import { useUserStore } from "@/stores/userStore";
import { uploadFileToFlashcardsFilesBucket } from "@/actions/storageActions";
import { extractTextFromPdfUrl } from "@/utils/pdfTextExtract";

type FileUploadFormValues = {
  uploadedFile: File[];
};

const flashcardsSchemaForBasicInfo = z.object({
  id: z.number().int().optional(),
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  visibility: z.string().min(1, "Visibility is required."),
  category: z.string().min(1, "Category is required."),
  created_by: z.string().uuid().optional(),
});

type CreateFlashcardsFormValues = z.infer<typeof flashcardsSchemaForBasicInfo>;

const CreateFlashcardsWithAIForm = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [basicFlashcardsInfoSubmitted, setBasicFlashcardsInfoSubmitted] =
    useState(false);
  const [createdFlashcardsId, setCreatedFlashcardsId] = useState<number | null>(
    null
  );
  const [createdFlashcardsData, setCreatedFlashcardsData] =
    useState<CreateFlashcardsFormValues | null>(null);
  const [clickedToGenerateQuestions, setClickedToGenerateQuestions] =
    useState(false);

  const [numFlashcards, setNumFlashcards] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<
    unknown[] | null
  >(null);
  const [errorGenerating, setErrorGenerating] = useState<string | null>(null);

  const handleGenerateFlashcards = async () => {
    if (!fileUrl || !createdFlashcardsId) return;

    console.log("Generating flashcards for: ", createdFlashcardsData);

    setIsGenerating(true);
    setGeneratedFlashcards(null);

    try {
      const prompt = await extractTextFromPdfUrl(fileUrl);

      const res = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          numFlashcards: numFlashcards,
        }),
      });

      const data = await res.json();
      console.log("Generated flashcards:", data);

      if (Array.isArray(data.flashcards)) {
        setGeneratedFlashcards(data.flashcards);

        if (!createdFlashcardsData) {
          toast.error("Missing flashcards details. Cannot save flashcards.");
          return;
        }

        const updateResult = await updateFlashcardsSet({
          ...createdFlashcardsData,
          id: createdFlashcardsId,
          flashcards: data.flashcards,
          created_by: user?.id,
        });

        if (updateResult.success) {
          toast.success("Flashcards successfully saved!");
        } else {
          toast.error("Failed to save flashcards.");
          console.error(updateResult.message);
        }
      } else {
        toast.error("Invalid flashcards format returned from API.");
      }
    } catch (err) {
      console.error("Error generating flashcards:", err);
      toast.error("Failed to generate flashcards.");
      setErrorGenerating("Failed to generate flashcards. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const {
    handleSubmit: onSubmitFileUpload,
    setValue: setFileValue,
    watch: watchFileUpload,
    formState: { errors: fileUploadErrors },
  } = useForm<FileUploadFormValues>();

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;

    const uploadedFile = files[0]; // Only support single file upload

    try {
      const publicUrl = await uploadFileToFlashcardsFilesBucket(
        uploadedFile,
        user?.id as string,
        createdFlashcardsId as number
      );
      if (publicUrl) {
        setFileValue("uploadedFile", files, { shouldValidate: true });
        setFileUrl(publicUrl);
        toast.success("File uploaded successfully!");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Error uploading file: ${error.message}`);
      } else {
        toast.error("Error uploading file: Unknown error");
      }
    }
  };

  const onSubmitFileUPloadForm = (data: FileUploadFormValues) => {
    console.log("File uploaded:", data.uploadedFile);
    console.log("Public URL:", fileUrl);
    setClickedToGenerateQuestions(true);
  };

  const uploadedFiles = watchFileUpload("uploadedFile");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateFlashcardsFormValues>({
    resolver: zodResolver(flashcardsSchemaForBasicInfo),
    defaultValues: {
      visibility: "everyone",
    },
  });

  const onSubmit = async (data: CreateFlashcardsFormValues) => {
    data.created_by = user?.id;

    const createdFlashcardsData = await createFlashcards(data);
    setCreatedFlashcardsId(createdFlashcardsData.flashcardsId);
    setBasicFlashcardsInfoSubmitted(true);
    setCreatedFlashcardsData(data);

    toast.success("Flashcards created successfully!");
  };

  return (
    <div>
      {!basicFlashcardsInfoSubmitted ? (
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
                <Label htmlFor="title">Visible to</Label>
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

          {/* Submit Button */}
          <div className="flex justify-center my-8">
            <Button
              type="submit"
              className="bg-purple hover:bg-purple-500 dark:text-white"
            >
              Save and Continue
            </Button>
          </div>
        </form>
      ) : (
        <>
          {!clickedToGenerateQuestions ? (
            <form
              onSubmit={onSubmitFileUpload(onSubmitFileUPloadForm)}
              className="space-y-4 flex flex-col justify-center max-w-4xl mx-auto"
            >
              {uploadedFiles?.length === 0 && (
                <p className="text-center mb-4">
                  Your test has been saved to database. Now upload a pdf file to
                  generate questions.
                </p>
              )}

              <div className="w-full max-w-4xl mx-auto min-h-80 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg mb-4">
                <FileUpload onChange={handleFileUpload} />
              </div>

              {fileUploadErrors.uploadedFile && (
                <p className="text-red-500">File is required</p>
              )}

              {uploadedFiles?.length > 0 && (
                <Button
                  type="submit"
                  className="bg-purple hover:bg-purple-500 dark:text-white mx-auto"
                >
                  Continue to Generate Flashcards
                </Button>
              )}
            </form>
          ) : (
            <div>
              {uploadedFiles?.length > 0 && fileUrl && (
                <div className="flex flex-col justify-center max-w-4xl mx-auto">
                  <div className="dark:bg-muted border rounded-md p-6 space-y-4 bg-gray-100">
                    <div className="space-y-2 pb-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="Enter a title, like Introduction to AI"
                        readOnly
                        {...register("title")}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        placeholder="Add a description..."
                        readOnly
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
                        <Label htmlFor="title">Visible to</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue("visibility", value)
                          }
                          disabled
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
                          readOnly
                          {...register("category")}
                        />
                        {errors.category && (
                          <p className="text-sm text-red-500">
                            {errors.category.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Uploaded File: </Label>
                      <Link
                        href={fileUrl}
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        {uploadedFiles[0].name}
                      </Link>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    {!generatedFlashcards && (
                      <div className="flex flex-row gap-4 justify-center items-end">
                        <div className="w-1/3 space-y-2">
                          <Label htmlFor="numQuestions">
                            Number of flashcards
                          </Label>
                          <Input
                            id="numFlashcards"
                            type="number"
                            min={1}
                            max={50}
                            value={numFlashcards}
                            onChange={(e) =>
                              setNumFlashcards(Number(e.target.value))
                            }
                          />
                        </div>

                        <div>
                          <Button
                            onClick={handleGenerateFlashcards}
                            disabled={isGenerating}
                            className="bg-purple hover:bg-purple-500 dark:text-white mx-auto flex items-center gap-2"
                          >
                            {isGenerating && (
                              <div role="status">
                                <svg
                                  aria-hidden="true"
                                  className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                  viewBox="0 0 100 101"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                  />
                                </svg>
                                <span className="sr-only">Loading...</span>
                              </div>
                            )}
                            {isGenerating
                              ? "Generating..."
                              : "Generate Flashcards"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {errorGenerating && (
                      <p className="text-red-500 text-sm">{errorGenerating}</p>
                    )}

                    {generatedFlashcards && (
                      <>
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold">
                            Generated Flashcards
                          </h3>
                          {generatedFlashcards.map((f, idx) => {
                            const flashcard = f as {
                              id?: string | number;
                              term: string;
                              definition: string;
                            };
                            return (
                              <div
                                key={flashcard.id || idx}
                                className="p-4 border rounded bg-white dark:bg-muted"
                              >
                                <Label className="font-semibold">Term:</Label>
                                <p className="mb-2">{flashcard.term}</p>
                                <Label className="font-semibold">
                                  Definition:
                                </Label>
                                <p>{flashcard.definition}</p>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-center">
                          <Button
                            onClick={() => {
                              if (createdFlashcardsId) {
                                router.push(
                                  `/flashcards/${createdFlashcardsId}`
                                );
                              }
                            }}
                            disabled={!createdFlashcardsId}
                            className="bg-purple hover:bg-purple-500 dark:text-white"
                          >
                            View Flashcards
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CreateFlashcardsWithAIForm;
