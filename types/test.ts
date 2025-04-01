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
  image_url?: string;
  correct: number;
};

export type TestSubmission = {
  id?: number;
  test_id: number;
  user_id: string;
  submitted_at?: string;
  number_of_questions: number;
  correct_answers: number;
  answers: TestSubmissionAnswers[];
};

type TestSubmissionAnswers = {
  question_id: number;
  selected_answer: number;
};
