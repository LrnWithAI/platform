"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
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
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  getTestById,
  deleteTest,
  updateTest,
  createTestSubmission,
} from "@/actions/testActions";
import { Test } from "@/types/test";
import { useUserStore } from "@/stores/userStore";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { testSchema } from "@/schema/test";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TestSubmission } from "@/types/test";
import { uploadFileToTestQuestionsBucket } from "@/actions/storageActions";

type CreateTestFormValues = z.infer<typeof testSchema>;

const TestPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const user = useUserStore((state) => state.user);
  const testId = Number(params.id);
  const [test, setTest] = useState<Test | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isQuestionsLoaded, setIsQuestionsLoaded] = useState(false);

  const [selectedCorrectAnswers, setSelectedCorrectAnswers] = useState<
    Record<number, number>
  >({});

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const fetchTestById = useCallback(async () => {
    try {
      const response = await getTestById(testId);

      if (response.success) {
        setTest(() => response.data[0]);
      } else {
        toast.error(response.message || "Failed to fetch tests.");
      }
    } catch (error) {
      console.error("Error fetching test:", error);
      toast.error("An error occurred while fetching tests.");
    }
  }, [testId]);

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    setValue: setValueEdit,
    getValues: getValuesEdit,
  } = useForm<CreateTestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: test?.title,
      description: test?.description,
      category: test?.category,
      visibility: test?.visibility,
      questions: [
        {
          id: 1,
          question: "",
          answers: ["", "", "", ""],
          correct: 0,
          image_url: undefined,
        },
      ],
    },
  });

  const handleImageUpload = async (
    questionIndex: number,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const userId = user?.id;
    const questions = getValuesEdit("questions");

    if (!userId || !testId || !questions[questionIndex]?.id) {
      toast.error("Invalid data for upload.");
      return;
    }

    try {
      const publicUrl = await uploadFileToTestQuestionsBucket(
        file,
        userId,
        testId,
        questions[questionIndex].id
      );

      if (publicUrl) {
        setValueEdit(`questions.${questionIndex}.image_url`, publicUrl, {
          shouldValidate: true,
        });
        toast.success("Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Upload failed!");
    }
  };

  useEffect(() => {
    fetchTestById();
  }, [params, fetchTestById]);

  const onSubmitTestAnswers = async (data: any) => {
    if (!test) return;

    // Remove null values from answers
    const cleanedAnswers: number[] = data.answers.filter(
      (ans: number | null) => ans !== null
    ) as number[];

    // Map answers to include question IDs correctly
    const formattedAnswers = cleanedAnswers
      .map((selected_answer: number, index: number) => {
        const question = test?.questions?.[index]; // Get correct question
        if (!question) {
          console.warn(`Skipping: No question found for index ${index}`);
          return null;
        }
        return { question_id: question.id, selected_answer };
      })
      .filter(
        (ans): ans is { question_id: number; selected_answer: number } =>
          ans !== null
      ); // Remove null values safely

    const correctAnswers = formattedAnswers.filter((ans) => {
      const question = test?.questions?.find((q) => q.id === ans.question_id);
      return question && question.correct === ans.selected_answer;
    }).length;

    const formattedSubmission: TestSubmission = {
      test_id: testId,
      user_id: user?.id || "", // Ensure user ID is available
      submitted_at: new Date().toISOString(), // Current timestamp
      number_of_questions: test?.questions?.length || 0,
      correct_answers: correctAnswers,
      answers: formattedAnswers,
    };

    const testSubmission = await createTestSubmission(formattedSubmission);

    console.log("testSubmission", testSubmission);

    if (!testSubmission.success) {
      console.error(
        "Failed to create test submission:",
        testSubmission.message
      );
      return;
    }

    router.push(`/test/${test?.id}/submit/${testSubmission?.testSubmissionId}`);
  };

  const onDeleteTest = async () => {
    toast
      .promise(deleteTest(testId, user?.id as string), {
        pending: "Deleting test...",
        success: "Test deleted successfully.",
        error: "Failed to delete test.",
      })
      .then((response) => {
        if (response.success) {
          router.push("/library");
        }
      });
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const setCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    setValueEdit(`questions.${questionIndex}.correct`, answerIndex);
    setSelectedCorrectAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const addQuestion = useCallback(() => {
    const existingQuestions = getValuesEdit("questions") || [];

    const ids = existingQuestions
      .map((q) => q.id)
      .filter((id): id is number => id !== undefined);

    const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

    append({ id: nextId, question: "", answers: ["", "", "", ""], correct: 0 });
  }, [getValuesEdit, append]);

  const removeQuestion = (index: number) => {
    remove(index);
    const updatedQuestions = getValuesEdit("questions").filter(
      (_, i) => i !== index
    );

    setValueEdit("questions", updatedQuestions); // Update the state properly

    setTimeout(() => {
      updatedQuestions.forEach((_, i) => {
        setValueEdit(`questions.${i}.id`, i + 1); // Reassign IDs sequentially
      });
    }, 0);
  };

  useEffect(() => {
    if (test) {
      // Set basic test details
      setValueEdit("title", test.title || "");
      setValueEdit("description", test.description || "");
      setValueEdit("category", test.category || "");
      setValueEdit("visibility", test.visibility || "everyone");

      // Ensure the questions field is set correctly
      if (test.questions && test.questions.length > 0) {
        setValueEdit(
          "questions",
          test.questions.map((q, index) => ({
            id: q.id ?? index + 1,
            question: q.question || "",
            answers: q.answers || ["", "", "", ""],
            correct: q.correct ?? 0,
            image_url: q.image_url || undefined,
          }))
        );

        // Update selected correct answers for UI
        setSelectedCorrectAnswers(
          test.questions.reduce((acc, q, index) => {
            acc[index] = q.correct ?? 0;
            return acc;
          }, {} as Record<number, number>)
        );

        // Add questions to the form state if not loaded yet
        if (!isQuestionsLoaded) {
          // Trigger addQuestion() for each question
          test.questions.forEach(() => {
            addQuestion();
          });
          setIsQuestionsLoaded(true); // Set flag to avoid redundant addition
        }
      }
    }
  }, [test, addQuestion, isQuestionsLoaded, setValueEdit]); // Runs when `test` is loaded

  const onSubmitEditTest = async (data: CreateTestFormValues) => {
    data.created_by = user?.id;
    data.id = test?.id;

    await updateTest(data);
    toast.success("Test edited successfully!");

    await fetchTestById();
    setIsEditMode(false);
  };

  return (
    <div className="mx-4 mb-20 mt-0 md:mt-6">
      {user?.id === test?.created_by && (
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-row justify-end space-x-2">
            {!isEditMode && (
              <Button
                onClick={() => setIsEditMode(!isEditMode)}
                variant="outline"
              >
                Edit test
              </Button>
            )}

            {isEditMode && (
              <Button
                onClick={() => setIsEditMode(!isEditMode)}
                variant="outline"
              >
                Cancel
              </Button>
            )}
            <Button onClick={onDeleteTest} variant="destructive">
              Delete Test
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
        <form
          onSubmit={handleSubmit(onSubmitTestAnswers)}
          className={`flex flex-col justify-center max-w-4xl mx-auto ${
            isEditMode ? "border border-green-400 p-4 rounded-lg" : ""
          }`}
        >
          <div className="flex flex-row justify-between items-center my-8">
            <div>
              <h2 className="text-lg md:text-2xl font-bold">{test?.title}</h2>
              <p className="text-sm md:text-lg">{test?.description}</p>
            </div>
            <div>
              <h4 className="text-sm md:text-md font-bold">
                Created{" "}
                {test?.created_at
                  ? new Date(Date.parse(test.created_at)).toLocaleDateString(
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
                  {user?.id === test?.created_by
                    ? user?.username
                    : "some nickname"}
                </Link>
              </p>
            </div>
          </div>
          {/* One question */}
          {test?.questions?.map((question, index) => (
            <div
              key={index}
              className="dark:bg-muted border flex flex-col rounded-md p-6 space-y-4 bg-gray-100 my-2 md:my-4"
            >
              <p>
                {index + 1}. {question.question}
              </p>

              {question.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={question.image_url}
                  alt="Uploaded question image"
                  className="mt-2 w-full h-96 object-cover border"
                />
              )}

              <div className="py-2">
                <Controller
                  name={`answers.${index + 1}`}
                  control={control}
                  rules={{ required: "This question is required" }}
                  render={({ field }) => (
                    <RadioGroup
                      className="space-y-2"
                      onValueChange={(selectedValue) =>
                        field.onChange(Number(selectedValue))
                      }
                      value={field.value?.toString() || ""}
                    >
                      {question.answers.map((answer, ansIndex) => (
                        <div
                          key={ansIndex}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={ansIndex.toString()}
                            id={`answer-${index + 1}-${ansIndex}`}
                          />
                          <Label htmlFor={`answer-${index + 1}-${ansIndex}`}>
                            {answer}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              className="bg-purple dark:text-white hover:bg-purple-500"
            >
              Submit
            </Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleSubmitEdit(onSubmitEditTest)}
          className={`flex flex-col justify-center max-w-4xl mx-auto border border-green-400 p-4 rounded-lg`}
        >
          {/* Edit mode */}
          <div className="dark:bg-muted border rounded-md p-6 space-y-4 bg-gray-100">
            <div className="space-y-2 pb-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter a title, like Introduction to AI"
                {...registerEdit("title")}
              />
              {errors.title && typeof errors.title.message === "string" && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                placeholder="Add a description..."
                {...registerEdit("description")}
              />
              {errors.description &&
                typeof errors.description.message === "string" && (
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
                      {...registerEdit(`questions.${questionIndex}.question`)}
                    />
                  </div>

                  <div key={field.id} className="py-2 space-y-2">
                    <Label>Image (optional)</Label>
                    <Input
                      type="file"
                      className="border bg-gray-50 cursor-pointer dark:bg-neutral-900 dark:border-neutral-700"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(questionIndex, e.target.files)
                      }
                    />
                    {getValuesEdit(`questions.${questionIndex}.image_url`) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          getValuesEdit(
                            `questions.${questionIndex}.image_url`
                          ) || ""
                        }
                        alt="Uploaded"
                        className="mt-2 w-full h-96 object-cover border"
                      />
                    )}
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
                              {...registerEdit(
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
                  type="button"
                >
                  Remove question
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Question */}
          <div className="flex justify-center my-6">
            <Button variant="outline" onClick={addQuestion} type="button">
              Add Question
            </Button>
          </div>

          {/* Submit Button */}
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

export default TestPage;
