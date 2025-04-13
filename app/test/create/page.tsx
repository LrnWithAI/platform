"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { testSchema } from "@/schema/test";
import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";
import CreateTestWithAIForm from "@/components/test-create-with-ai";

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

import { createTest } from "@/actions/testActions";
import { useUserStore } from "@/stores/userStore";
import {
  uploadFileToTestFilesBucket,
  uploadFileToTestQuestionsBucket,
} from "@/actions/storageActions";

type CreateTestFormValues = z.infer<typeof testSchema>;

type FileUploadFormValues = {
  uploadedFile: File[];
};

export default function CreateTest() {
  const params = useSearchParams();
  const { user } = useUserStore();
  const option = params.get("option");

  const router = useRouter();

  const [selectedCorrectAnswers, setSelectedCorrectAnswers] = useState<
    Record<number, number>
  >({});

  console.log("user", user);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<CreateTestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      visibility: "everyone",
      questions: [
        {
          id: 1,
          question: "",
          answers: ["", "", "", ""],
          correct: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const setCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    setValue(`questions.${questionIndex}.correct`, answerIndex);
    setSelectedCorrectAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const addQuestion = () => {
    const existingQuestions = getValues("questions") || [];

    // Ensure we only use valid numbers for max calculation
    const ids = existingQuestions
      .map((q) => q.id)
      .filter((id): id is number => id !== undefined);

    const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

    append({ id: nextId, question: "", answers: ["", "", "", ""], correct: 0 });
  };

  const removeQuestion = (index: number) => {
    remove(index);

    setTimeout(() => {
      const updatedFields = getValues("questions"); // Get the updated array
      updatedFields.forEach((_, i: number) => {
        setValue(`questions.${i}.id`, i + 1); // Reassign IDs sequentially
      });
    }, 0);
  };

  console.log("Form errors ", errors);

  const onSubmit = async (data: CreateTestFormValues) => {
    console.log("Submitted data", data);
    data.created_by = user?.id;

    const test = await createTest(data);
    toast.success("Test created successfully!");
    router.push(`/test/${test?.testId}`);
  };

  return (
    <div className="mx-4 mb-20">
      <div className="flex flex-row justify-center my-8">
        <h2 className="text-2xl font-bold">
          Create a new test {option == "withAI" ? "with AI" : "manually"}
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

          <div className="my-4">
            <h2 className="text-xl font-bold">Questions</h2>
          </div>

          <div className="space-y-6">
            {fields.map((field, questionIndex) => (
              <div
                key={field.id}
                className="flex flex-col dark:bg-muted border rounded-md p-6 space-y-2"
              >
                <div>
                  <div className="mb-2 space-y-2">
                    <Label>Question {questionIndex + 1}</Label>
                    <Input
                      type="text"
                      placeholder="Enter a question, like What is AI?"
                      {...register(`questions.${questionIndex}.question`)}
                    />
                  </div>

                  <div className="mb-2 space-y-2">
                    <Label>Answers</Label>
                    {Array(4)
                      .fill(null)
                      .map((_, answerIndex) => {
                        return (
                          <div
                            key={answerIndex}
                            className="flex items-center space-x-2"
                          >
                            <Input
                              type="text"
                              placeholder={`Answer ${String.fromCharCode(
                                65 + answerIndex
                              )}`}
                              {...register(
                                `questions.${questionIndex}.answers.${answerIndex}`
                              )}
                            />
                            <Button
                              variant={
                                selectedCorrectAnswers[questionIndex] ===
                                answerIndex
                                  ? "default"
                                  : "outline"
                              }
                              size="icon"
                              onClick={() =>
                                setCorrectAnswer(questionIndex, answerIndex)
                              }
                              type="button"
                            >
                              <Check />
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="bg-red-500 w-36 self-end"
                  onClick={() => removeQuestion(questionIndex)}
                >
                  Remove question
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Question */}
          <div className="flex justify-center my-6">
            <Button variant="outline" onClick={addQuestion}>
              Add Question
            </Button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              className="bg-purple hover:bg-purple-500 dark:text-white"
            >
              Create Test
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
