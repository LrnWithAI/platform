"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { getTestById, getTestSubmissionById } from "@/actions/testActions";
import { Test } from "@/types/test";
import { useUserStore } from "@/stores/userStore";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, XCircle } from "lucide-react"; // Icons for check and cross
import { TestSubmission } from "@/types/test";

const TestSubmitPageWithId = () => {
  const params = useParams<{ id: string; submit_id: string }>();
  const testId = Number(params.id);
  const submitId = Number(params.submit_id);
  const user = useUserStore((state) => state.user);

  const [test, setTest] = useState<Test | null>(null);
  const [testSubmission, setTestSubmission] = useState<TestSubmission | null>(
    null
  );

  const fetchTestByIdAndSubmission = useCallback(async () => {
    try {
      const response = await getTestById(testId);
      const submissionResponse = await getTestSubmissionById(submitId);

      if (response.success) {
        setTest(() => response.data[0]);
      } else {
        toast.error(response.message || "Failed to fetch tests.");
      }

      if (submissionResponse?.success) {
        setTestSubmission(() => submissionResponse.data);
        console.log("testSubmission", submissionResponse.data);
      } else {
        toast.error(
          submissionResponse?.message || "Failed to fetch submission."
        );
      }
    } catch (error) {
      console.error("Error fetching test or submission:", error);
      toast.error("An error occurred while fetching tests.");
    }
  }, [testId, submitId]);

  useEffect(() => {
    fetchTestByIdAndSubmission();
  }, [params, fetchTestByIdAndSubmission]);

  return (
    <div className="mx-4 mb-20 mt-0 md:mt-6">
      <h1 className="text-2xl font-bold text-center">Test Results</h1>
      <p className="text-lg font-semibold text-center my-4">
        Correct answers: {testSubmission?.correct_answers} /{" "}
        {test?.questions?.length}
      </p>

      <form className="flex flex-col justify-center max-w-4xl mx-auto">
        <div className="flex flex-row justify-between items-center my-8">
          <div>
            <h2 className="text-lg md:text-2xl font-bold">{test?.title}</h2>
            <p className="text-sm md:text-lg">{test?.description}</p>
          </div>
          <div>
            <h4 className="text-sm md:text-md font-bold">
              Submitted{" "}
              {testSubmission?.submitted_at
                ? new Date(
                    Date.parse(testSubmission.submitted_at)
                  ).toLocaleString("sk-SK", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
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

        {/* Display Questions & Answers */}
        {test?.questions?.map((question, qIndex) => {
          const correctIndex = question.correct;
          const userAnswer = testSubmission?.answers.find(
            (ans) => ans.question_id === question.id
          )?.selected_answer;

          return (
            <div
              key={qIndex}
              className="dark:bg-muted border flex flex-col rounded-md p-6 space-y-4 bg-gray-100 my-2 md:my-4"
            >
              <p className="font-semibold">
                {qIndex + 1}. {question.question}
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
                <RadioGroup className="space-y-2">
                  {question.answers.map((answer, aIndex) => {
                    const isCorrect = aIndex === correctIndex;
                    const isUserAnswer = aIndex === userAnswer;

                    return (
                      <div
                        key={aIndex}
                        className={`flex flex-row justify-between space-x-2 p-2 rounded-md ${
                          isCorrect
                            ? "bg-green-200" // Highlight correct answer in green
                            : isUserAnswer
                            ? "bg-red-200" // Highlight wrong submitted answer in red
                            : "bg-white"
                        }`}
                      >
                        <div className="flex flex-row align-center space-x-2">
                          <RadioGroupItem
                            value={aIndex.toString()}
                            checked={isUserAnswer}
                          />
                          <Label htmlFor={aIndex.toString()}>{answer}</Label>
                        </div>

                        {isUserAnswer && (
                          <span>
                            {isCorrect ? (
                              <CheckCircle className="text-green-600 w-4 h-4" />
                            ) : (
                              <XCircle className="text-red-600 w-4 h-4" />
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button className="bg-purple dark:text-white hover:bg-purple-500">
            <Link href={`/test/${test?.id}`}>Submit new answer</Link>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TestSubmitPageWithId;
