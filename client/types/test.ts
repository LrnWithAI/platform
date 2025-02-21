export type Test = {
  id?: number;
  created_at?: string;
  title: string;
  description: string;
  visibility: string;
  category?: string;
  questions?: Question[];
  created_by?: string;
};

export type Question = {
  id?: number;
  question: string;
  answers: string[];
  correct: number;
};
