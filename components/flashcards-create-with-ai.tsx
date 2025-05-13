"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";

import { useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
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
import { uploadFileToFlashcardsFilesBucket } from "@/actions/storageActions";

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
  const { user } = useUserStore();
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [basicFlashcardsInfoSubmitted, setBasicFlashcardsInfoSubmitted] =
    useState(false);
  const [createdFlashcardsId, setCreatedFlashcardsId] = useState<number | null>(
    null
  );
  const [clickedToGenerateQuestions, setClickedToGenerateQuestions] =
    useState(false);

  const {
    register: registerFileUpload,
    handleSubmit: onSubmitFileUpload,
    setValue: setFileValue,
    watch: watchFileUpload,
    formState: { errors: fileUploadErrors },
  } = useForm<FileUploadFormValues>();

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);

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
    } catch (error: any) {
      toast.error(`Error uploading file: ${error.message}`);
      console.error(error);
    }

    setUploading(false);
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

  console.log("errors", errors);

  const onSubmit = async (data: CreateFlashcardsFormValues) => {
    console.log("submitted data", data);
    data.created_by = user?.id;

    const createdFlashcardsData = await createFlashcards(data);
    setCreatedFlashcardsId(createdFlashcardsData.flashcardsId);
    setBasicFlashcardsInfoSubmitted(true);

    toast.success("Test created successfully!");
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
            <Button type="submit" className="bg-purple hover:bg-purple-500">
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
                  Continue to Generate Questions
                </Button>
              )}
            </form>
          ) : (
            <div>
              {uploadedFiles?.length > 0 && fileUrl && (
                <div className="mt-4">
                  <p>
                    We are generating questions for you. This might take a few
                    seconds...
                  </p>
                  <p>Uploaded File: {uploadedFiles[0].name}</p>
                  <p>
                    Public link of your file on our server{" "}
                    <Link
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      Click to view.
                    </Link>
                  </p>
                  TODO: <br /> - preview the file here <br /> - input field for
                  number of questions to generate <br /> - button to start
                  generating
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
