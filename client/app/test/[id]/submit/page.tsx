"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { getTestById } from "@/actions/testActions";
import { Test } from "@/types/test";
import { useUserStore } from "@/stores/userStore";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, XCircle } from "lucide-react"; // Icons for check and cross

const TestSubmitPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const user = useUserStore((state) => state.user);
  const searchParams = useSearchParams();
  const submittedAnswers: number[] = JSON.parse(
    searchParams.get("answers") || "[]"
  ).filter((answer: number | null): answer is number => answer !== null);

  const testId = Number(params.id);
  const [test, setTest] = useState<Test | null>(null);
  const [score, setScore] = useState(0);

  console.log("answers", submittedAnswers);

  async function fetchTestById() {
    try {
      const response = await getTestById(testId);
      if (response.success) {
        setTest(() => response.data[0]);
      } else {
        toast.error(response.message || "Failed to fetch tests.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching tests.");
    }
  }

  useEffect(() => {
    fetchTestById();
  }, [params]);

  useEffect(() => {
    if (test && submittedAnswers.length > 0) {
      let correctCount = 0;

      test.questions &&
        test?.questions.forEach((question, index) => {
          if (question.correct === submittedAnswers[index]) {
            correctCount++;
          }
        });

      setScore(correctCount);
    }
  }, [test]);

  return (
    <div className="mx-4 mb-20 mt-0 md:mt-6">
      <h1 className="text-2xl font-bold text-center">Test Results</h1>
      <p className="text-lg font-semibold text-center my-4">
        Correct answers: {score} / {test?.questions?.length}
      </p>

      <form className="flex flex-col justify-center max-w-4xl mx-auto">
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
              {user?.id === test?.created_by ? user?.username : "some nickname"}
            </p>
          </div>
        </div>

        {/* Display Questions & Answers */}
        {test?.questions?.map((question, qIndex) => {
          const correctIndex = question.correct;
          const userAnswerIndex = submittedAnswers[qIndex];

          return (
            <div
              key={qIndex}
              className="dark:bg-muted border flex flex-col rounded-md p-6 space-y-4 bg-gray-100 my-2 md:my-4"
            >
              <p className="font-semibold">
                {qIndex + 1}. {question.question}
              </p>
              <div className="py-2">
                <RadioGroup className="space-y-2">
                  {question.answers.map((answer, aIndex) => {
                    const isCorrect = aIndex === correctIndex;
                    const isUserAnswer = aIndex === userAnswerIndex;

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
          <Button className="bg-purple">
            <Link href={`/test/${test?.id}`}>Submit new answer</Link>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TestSubmitPage;
