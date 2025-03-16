export type User = {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  username: string;
  role: string;
  email: string;
  updated_at: string;
  avatar_url: string;
  website: string;
  phone: string;
  workplace: string;
  about: string;
} | null;

export type UserState = {
  user: User;
  setUser: (user: User) => void;
  clearUser: () => void;
};
