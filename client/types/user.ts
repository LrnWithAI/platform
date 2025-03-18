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
  bio: string;
  whatIDo: string;
  announcements: string;
  files: [
    {
      id: string;
      name: string;
      size: number;
      type: string;
      url: string;
    }
  ]
} | null;

export type UserState = {
  user: User;
  setUser: (user: User) => void;
  clearUser: () => void;
};