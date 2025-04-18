"use client";

import { useState, useEffect } from "react";
import { FlashcardsSet } from "@/types/flashcards";
import FlashcardsCard from "@/components/flashcards-card";

type Props = {
  flashcardsSet: FlashcardsSet;
};

export default function FlashcardsCardsStack({ flashcardsSet }: Props) {
  const flashcards = flashcardsSet?.flashcards || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [starredCards, setStarredCards] = useState<Set<number>>(new Set());
  const [showBack, setShowBack] = useState(false);

  // Handle keydown events for navigation, star toggle, and flip
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        // Handle previous card navigation
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        // Handle next card navigation
        handleNext();
      } else if (event.key.toLowerCase() === "s") {
        // Handle star toggle
        toggleStar(currentIndex);
      } else if (event.key === " " || event.key === "Spacebar") {
        // Handle card flip
        flip();
      }
    };

    // Attach the event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleStar = (index: number) => {
    const updatedStarredCards = new Set(starredCards);
    if (updatedStarredCards.has(index)) {
      updatedStarredCards.delete(index);
    } else {
      updatedStarredCards.add(index);
    }
    setStarredCards(updatedStarredCards);
  };

  const flip = () => {
    setShowBack((prev) => !prev);
  };

  const currentCard = flashcards[currentIndex];

  if (!currentCard) {
    return <p>No flashcards found.</p>;
  }

  return (
    <div className="flex flex-col items-center py-4">
      <FlashcardsCard
        term={currentCard.term}
        definition={currentCard.definition}
        isStarred={starredCards.has(currentIndex)}
        toggleStar={() => toggleStar(currentIndex)}
        showBack={showBack}
        flip={flip}
      />

      <div className="flex flex-row justify-between align-center mt-14 w-full">
        <div>
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
        </div>
        <div>
          <p className="text-lg text-gray-500">
            {currentIndex + 1} / {flashcards.length}
          </p>
        </div>

        <div>
          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
