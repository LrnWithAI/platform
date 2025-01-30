export type Report = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  created_by: {
    id: number;
    name: string;
    role: string;
    email: string;
  };
}

export type ReportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
}