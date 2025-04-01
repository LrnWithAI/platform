"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getTestById } from "@/actions/testActions";
import { Test } from "@/types/test";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

const TestSubmitPage = () => {
  const params = useParams<{ id: string }>();
  const testId = Number(params.id);
  const [test, setTest] = useState<Test | null>(null);

  useEffect(() => {
    const fetchTestById = async () => {
      const response = await getTestById(testId);
      if (response.success) setTest(response.data[0]);
    };
    fetchTestById();
  }, [testId]);

  return (
    <div className="mx-4 mb-20 mt-6">
      <h1 className="text-2xl font-bold text-center">Test Results</h1>
      <p className="text-lg font-semibold text-center my-4">
        Correct answers: {test?.questions?.length}
      </p>

      <div className="max-w-4xl mx-auto">
        {test?.questions?.map((question, qIndex) => (
          <div
            key={qIndex}
            className="dark:bg-muted border flex flex-col rounded-md p-6 space-y-4 bg-gray-100 my-2 md:my-4"
          >
            <p className="font-semibold">
              {qIndex + 1}. {question.question}
            </p>
            <div className="space-y-2">
              {question.answers.map((answer, aIndex) => (
                <div
                  key={aIndex}
                  className={`flex flex-row justify-between space-x-2 p-2 rounded-md ${
                    aIndex === question.correct ? "bg-green-200" : "bg-white"
                  }`}
                >
                  <Label>{answer}</Label>
                  {aIndex === question.correct && (
                    <CheckCircle className="text-green-600 w-4 h-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestSubmitPage;
