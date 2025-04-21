import React, { useState } from "react";
import { Trash2 } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { useLoadingStore } from "@/stores/loadingStore";
import { useUserStore } from "@/stores/userStore";
import { Button } from "./ui/button";
import { deleteTest } from "@/actions/testActions";
import { deleteNote } from "@/actions/notesActions";
import { deleteFlashcardsSet } from "@/actions/flashcardsActions";

interface CardsProps {
  orderOption: string;
  filterOption: Record<string, string>;
  data: any[];
  type: string;
  refreshData: () => void;
}

export function Cards({
  orderOption,
  filterOption,
  data,
  type,
  refreshData,
}: CardsProps) {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const user = useUserStore((state) => state.user);

  // Filtering len pre 'title'
  const filteredData = data.filter((card) => {
    // Ak je nastavený filter pre title, porovnáme len tento atribút
    if (filterOption["title"]) {
      return card.title
        ?.toLowerCase()
        .includes(filterOption["title"].toLowerCase());
    }
    return true;
  });

  // Sorting – triedime len podľa created_at a title
  const sortedData = filteredData.sort((a, b) => {
    if (orderOption === "newest") {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    if (orderOption === "older") {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    if (orderOption === "a-z") {
      return a.title.localeCompare(b.title);
    }
    if (orderOption === "z-a") {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });

  // Funkcia pre odstránenie podľa typu
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);

      if (!user?.id) {
        toast.error("User ID is missing. Cannot delete the card.");
        return;
      }

      if (type === "tests") {
        await deleteTest(id, user.id);
      } else if (type === "flashcards") {
        await deleteFlashcardsSet(id, user.id);
      } else if (type === "notes") {
        await deleteNote(id, user.id);
      }

      refreshData();
      toast.success(`${type} deleted successfully!`);
    } catch (error) {
      toast.error("An error occurred while deleting the card.");
    } finally {
      setLoading(false);
    }
  };

  // Určenie cesty pre Link podľa typu
  const getLinkPath = (id: number) => {
    if (type === "tests") return `/test/${id}`;
    if (type === "notes") return `/notes/${id}`;
    if (type === "flashcards") return `/flashcards/${id}`;
    return "/";
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {sortedData.map((card) => (
        <div
          key={card.id}
          className="relative p-5 border rounded-lg shadow bg-white hover:cursor-pointer hover:scale-105 duration-300"
        >
          {/* Tlačidlo pre odstránenie */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              className="bg-red-500 rounded-sm text-sm hover:bg-red-600 h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(card.id);
              }}
            >
              <Trash2 size={16} />
            </Button>
          </div>

          {/* Navigácia podľa typu */}
          <Link href={getLinkPath(card.id)}>
            <h2 className="text-lg font-bold mb-2">{card.title}</h2>
            <div className="flex">
              <Image
                src="/class_cover.jpg"
                alt={`${type} ${card.id}`}
                width={60}
                height={20}
                unoptimized
              />
              <div className="ml-4 flex flex-col justify-center">
                <p className="text-sm text-gray-700 font-bold">
                  {new Date(card.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
