export type Note = {
  id?: number;
  title: string;
  content: string;
  created_at: string;
  created_by: {
    id: string;
    name: string;
    role: string;
    email: string;
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