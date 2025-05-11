export type FlashcardsSet = {
  id?: number;
  created_at?: string;
  title: string;
  description: string;
  visibility: string;
  category?: string;
  flashcards?: Flashcard[];
  created_by?: string;
};

export type Flashcard = {
  id?: number;
  term: string;
  definition: string;
  image_url?: string;
};

export type FlashcardsSubmission = {
  id?: number;
  flashcards_id: number;
  user_id: string;
  starred_card_ids: number[]; // Array of card IDs the user starred
  submitted_at?: string;
};

export type StarredFlashcards = {
  is_starred: boolean;
  question_id: number;
};
