export type Report = {
  id?: number;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  created_by: {
    id: number;
    name: string;
    role: string;
    email: string;
  };
  type: string;
  content_id: number;
  status: string;
}

export type ReportDialogProps = {
  isOpen: boolean;
  content_id: number | string;
  onClose: () => void;
  type: string;
}