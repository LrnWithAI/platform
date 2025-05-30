export type Class = {
  id: number;
  title: string;
  name: string;
  class_time: string;
  year: string;
  image: {
    name: string;
    url: string;
  };
  created_at: string;
  created_by: {
    id: number;
    name: string;
  };
  members: [
    {
      id: string;
      name: string;
      role: string;
      email: string;
      username: string;
    }
  ];
  content: [
    {
      id: number;
      title: string;
      content: string;
      created_at: string;
      updated_at: string;
      created_by: {
        id: number;
        name: string;
        full_name: string;
        username: string;
        role: string;
        email: string;
        avatar_url: string;
      };
      files: [
        {
          id: string;
          name: string;
          size: number;
          type: string;
          url: string;
        }
      ];
    }
  ];
};

export type ClassStore = {
  classes: Class[];
  setClasses: (classes: Class[]) => void;
  class: Class;
  getClassById: (id: number) => void;
};

export type ClassDialogProps = {
  type: "create" | "edit";
  onClose: () => void;
  isOpen: boolean;
  initialData?: {
    id?: number;
    title?: string;
    name?: string;
    class_time?: string;
    year?: string;
    image?: {
      name: string;
      url: string;
    };
  };
};
