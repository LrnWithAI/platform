"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClassesCards } from "@/components/class-cards";
import { toast } from "react-toastify";

import { getTestsByUserId, getTests } from "@/actions/testActions";
import { Test } from "@/types/test";
import { useLoadingStore } from "@/stores/loadingStore";
import { useUserStore } from "@/stores/userStore";
import {
  CreateTestDialog,
  CreateFlashcardsDialog,
} from "@/components/create-test-dialog";

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

      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <p>Tests</p>
          <CreateTestDialog />
        </div>
      </div>

      <ClassesCards orderOption={orderOption} filterOption={filterOption} />

      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <p>Flashcards</p>
          <CreateFlashcardsDialog />
        </div>
      </div>

      <ClassesCards orderOption={orderOption} filterOption={filterOption} />
    </div>
  );
}
