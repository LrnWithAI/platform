export type Class = {
  id: number;
  created_at: string;
  title: string;
  image_url: string;
  description1: string;
  members: string[];
}

export type ClassStore = {
  classes: Class[];
  setClasses: (classes: Class[]) => void;
}