"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";

import { getTestsByUserId, getTests } from "@/actions/testActions";
import { Test } from "@/types/test";
import { useLoadingStore } from "@/stores/loadingStore";
import { useUserStore } from "@/stores/userStore";
import { CreateTestDialog, CreateFlashcardsDialog, CreateNotesDialog } from "@/components/create-test-dialog";

const orderOptions = [
  { label: "Newest", value: "newest" },
  { label: "Older", value: "older" },
  { label: "A-Z", value: "a-z" },
  { label: "Z-A", value: "z-a" },
];

const filterOptions = [
  { label: "Name", value: "", name: "title" },
  { label: "Class Time", value: "", name: "description1" },
  { label: "Members", value: "", name: "members" },
];

export default function Library() {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const user = useUserStore((state) => state.user);
  const [tests, setTests] = useState([] as Test[]);

  async function fetchTests() {
    try {
      setLoading(true);

      if (!user) return;
      const response = await getTestsByUserId(user?.id);

      if (response.success) {
        setTests(response.data);
        toast.success("Tests fetched successfully!");
      } else {
        toast.error(response.message || "Failed to fetch tests.");
      }

      return response.data ?? [];
    } catch (error) {
      toast.error("An error occurred while fetching tests.");
      return [];
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTests();
    console.log("tests", tests);
  }, [user]);

  const [openOrderOption, setOpenOrderOption] = useState(false);
  const [orderOption, setOrderOption] = useState("");

  const [openFilterOption, setOpenFilterOption] = useState(false);
  const [filterOption, setFilterOption] = useState({});

  const updateFilterOption = (key: string, value: string) => {
    setFilterOption((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // TODO: Render cards for tests and flashcards separately without additional modal stuff there after clicking

  return (
    <div className="flex flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Your Library</h1>

      {/* Tests */}
      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <p>Tests</p>
          <CreateTestDialog />
        </div>
      </div>

      {tests ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="relative p-5 border rounded-lg shadow bg-white hover:cursor-pointer hover:scale-105 duration-300"
            >
              <Link href={`/test/${test.id}`}>
                <h2 className="text-lg font-bold mb-2">{test.title}</h2>
                <div className="flex">
                  <Image
                    src={"/class_cover.jpg"}
                    alt={`${test.title} cover image`}
                    className="w-14 h-14 object-cover rounded-md"
                    width={60}
                    height={20}
                  />
                  <div className="ml-4 flex flex-col justify-center">
                    <p className="text-sm text-gray-700 font-bold">
                      Created at{" "}
                      {test.created_at
                        ? new Date(
                          Date.parse(test.created_at)
                        ).toLocaleDateString("sk-SK", {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                        })
                        : "Invalid date"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {test.questions?.length && test.questions?.length > 1
                        ? test.questions?.length + " questions"
                        : test.questions?.length + " question"}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">
          You haven't created any tests yet. Click the plus icon to create a
          test.
        </div>
      )}
      {/* <Cards orderOption={orderOption} filterOption={filterOption} data={tests} type="tests" /> */}

      {/* FlashCards */}
      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <p>Flashcards</p>
          <CreateFlashcardsDialog />
        </div>
      </div>
      {/* <Cards orderOption={orderOption} filterOption={filterOption} data={flashcards} type="flashcards"/> */}

      {/* Notes */}
      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <p>Notes</p>
          <CreateNotesDialog />
        </div>
      </div>
      {/* <Cards orderOption={orderOption} filterOption={filterOption} data={notes} type="notes"/> */}
    </div>
  );
}