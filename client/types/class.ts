export type Class = {
  id: number;
  title: string;
  name: string;
  class_time: string;
  invitation_url: string;
  members: [
    {
      id: number;
      name: string;
      role: string;
      email: string;
    }
  ];
  year: string;
  image_url: string;
  created_at: string;
  created_by: {
    id: number;
    name: string;
  };
}

export type ClassStore = {
  classes: Class[];
  setClasses: (classes: Class[]) => void;
  class: Class;
  getClassById: (id: number) => void;
}