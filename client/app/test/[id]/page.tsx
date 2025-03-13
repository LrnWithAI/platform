"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { getTestById } from "@/actions/testActions";
import { Test } from "@/types/test";
import { useUserStore } from "@/stores/userStore";
import { useForm, Controller } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const TestPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const user = useUserStore((state) => state.user);
  const testId = Number(params.id);
  const [test, setTest] = useState<Test | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

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

  const onSubmit = async (data: any) => {
    const queryParams = new URLSearchParams({
      answers: JSON.stringify(data.answers),
    });

    router.push(`/test/${test?.id}/submit?${queryParams.toString()}`);
    console.log("test check data", data);
  };

  return (
    <div className="mx-4 mb-20 mt-0 md:mt-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center max-w-4xl mx-auto"
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
              {user?.id === test?.created_by ? user?.username : "some nickname"}
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
          <Button type="submit" className="bg-purple">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TestPage;
