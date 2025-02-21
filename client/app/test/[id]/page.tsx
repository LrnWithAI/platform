"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import { getTestById } from "@/actions/testActions";
import { Test } from "@/types/test";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const TestPage = () => {
  const params = useParams<{ id: string }>();
  const testId = Number(params.id);
  const [test, setTest] = useState<Test | null>(null);

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
    console.log("test data", test);
  }, [test]);

  return (
    <div className="mx-4 mb-20 mt-0 md:mt-6">
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
            <p>by matejkooo</p>
          </div>
        </div>

        {/* One question */}
        {test?.questions?.map((question, index) => (
          <div
            key={index}
            className="dark:bg-muted border flex flex-col rounded-md p-6 space-y-4 bg-gray-100 my-2 md:my-4"
          >
            <p>{question.question}</p>
            <div className="py-2">
              <RadioGroup className="space-y-2">
                {question.answers.map((answer, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={answer} />
                    <Label htmlFor={answer}>{answer}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        ))}
      </form>
    </div>
  );
};

export default TestPage;
