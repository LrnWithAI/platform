import React from "react";
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
import { Class } from "@/types/class";
import { Test } from "@/types/test";
import { Note } from "@/types/note";
import { FlashcardsSet } from "@/types/flashcards";

interface CardsProps {
  orderOption?: string;
  filterOption?: Record<string, string>;
  data: (Class | Test | FlashcardsSet | Note)[];
  type: string;
  refreshData: () => void;
}

// Type guards
const isNote = (card: Class | Test | FlashcardsSet | Note): card is Note =>
  "content" in card && "created_by" in card;

const isTest = (card: Class | Test | FlashcardsSet | Note): card is Test =>
  "questions" in card;

const isFlashcards = (card: Class | Test | FlashcardsSet | Note): card is FlashcardsSet =>
  "flashcards" in card;

const isClass = (card: Class | Test | FlashcardsSet | Note): card is Class =>
  "members" in card && "image" in card;

export function Cards({
  orderOption,
  filterOption,
  data,
  type,
  refreshData,
}: CardsProps) {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const user = useUserStore((state) => state.user);

  const filteredData = data.filter((card) => {
    if (filterOption && filterOption["title"]) {
      return card.title
        ?.toLowerCase()
        .includes(filterOption["title"].toLowerCase());
    }
    return true;
  });

  const sortedData = filteredData.sort((a, b) => {
    if (orderOption === "newest") {
      return (
        new Date(b.created_at ?? "").getTime() -
        new Date(a.created_at ?? "").getTime()
      );
    }
    if (orderOption === "older") {
      return (
        new Date(a.created_at ?? "").getTime() -
        new Date(b.created_at ?? "").getTime()
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

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      if (!user?.id) {
        toast.error("User ID is missing. Cannot delete the card.");
        return;
      }
      if (type === "tests") await deleteTest(id, user.id);
      else if (type === "flashcards") await deleteFlashcardsSet(id, user.id);
      else if (type === "notes") await deleteNote(id, user.id);

      refreshData();
      toast.success(`${type} deleted successfully!`);
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("An error occurred while deleting the card.");
    } finally {
      setLoading(false);
    }
  };

  const getLinkPath = (id: number) => {
    if (type === "tests") return `/test/${id}`;
    if (type === "notes") return `/notes/${id}`;
    if (type === "flashcards") return `/flashcards/${id}`;
    if (type === "classes") return `/classes/${id}`;
    return "/";
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {sortedData.map((card) => (
        <div
          key={card.id}
          className="relative p-5 border rounded-lg shadow bg-sidebar hover:cursor-pointer hover:scale-105 duration-300"
        >
          {(
            (typeof card.created_by === "object" &&
              card.created_by !== null &&
              "id" in card.created_by &&
              card.created_by.id === user?.id) ||
            (typeof card.created_by === "string" && card.created_by === user?.id) ||
            (typeof card.created_by === "number" && card.created_by === user?.id)
          ) && (
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  className="bg-red-500 rounded-sm text-sm hover:bg-red-600 h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (card.id !== undefined) handleDelete(card.id);
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            )}

          <Link href={card.id !== undefined ? getLinkPath(card.id) : "/"}>
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
                {card.created_at && (
                  <p className="text-sm text-gray-700 dark:text-gray-400 font-bold">
                    {new Date(card.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}

                {isTest(card) && card.questions?.length !== undefined && (
                  <p className="text-muted-foreground">
                    {card.questions.length}{" "}
                    {card.questions.length === 1 ? "question" : "questions"}
                  </p>
                )}

                {isFlashcards(card) &&
                  card.flashcards?.length !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      {card.flashcards.length}{" "}
                      {card.flashcards.length === 1 ? "card" : "cards"}
                    </p>
                  )}

                {isNote(card) && card.created_by && (
                  <p className="text-sm text-muted-foreground mt-1">
                    by{" "}
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/profile/${card.created_by.username}`;
                      }}
                      className="text-purple-600 hover:underline cursor-pointer"
                    >
                      {card.created_by.name}
                    </span>
                  </p>
                )}

                {isClass(card) && card.members && (
                  <p className="text text-muted-foreground">
                    {card.members.length}{" "}
                    {card.members.length === 1 ? "member" : "members"}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}