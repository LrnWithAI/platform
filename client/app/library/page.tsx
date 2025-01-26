"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClassesCards } from "@/components/class-cards";
import { toast } from "react-toastify";

import { createClass, getClasses } from "@/actions/classActions";
import { useLoadingStore } from "@/stores/loadingStore";
import { useClassStore } from "@/stores/classStore";
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
  const setClasses = useClassStore((state) => state.setClasses);

  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);
        const response = await getClasses();

        if (response) {
          setClasses(response.data);
          toast.success("Classes loaded successfully!");
        } else {
          toast.error("Failed to fetch classes.");
        }
      } catch (error) {
        toast.error("An error occurred while fetching classes.");
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, []);

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

  const [newClassData, setNewClassData] = useState({
    title: "",
    description1: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setNewClassData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateClass = async () => {
    try {
      setLoading(true);
      const response = await createClass(newClassData);

      if (response.success) {
        toast.success("Class created successfully!");

        // Fetch updated classes
        const updatedClasses = await getClasses();
        if (updatedClasses) {
          setClasses(updatedClasses.data);
          toast.success("Updated classes loaded successfully!");
        }
      } else {
        toast.error(response.message || "Failed to create class.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the class.");
    } finally {
      setLoading(false);
    }
  };

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
