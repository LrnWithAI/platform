'use client';

import React from 'react'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportDialogProps } from '@/types/report';
import { useUserStore } from '@/stores/userStore';
import { useLoadingStore } from '@/stores/loadingStore';
import { toast } from 'react-toastify';
import { ReportSchema } from '@/schema/report';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { createReport } from '@/actions/reportActions';

type ReportFormData = z.infer<typeof ReportSchema>;

const ReportDialog: React.FC<ReportDialogProps> = ({ isOpen, onClose, type }) => {
  const user = useUserStore((state) => state.user);
  const setLoading = useLoadingStore((state) => state.setLoading);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(ReportSchema),
    defaultValues: {
      title: "",
      description: ""
    },
  });

  const onSubmit = async (data: ReportFormData) => {
    try {
      onClose();
      setLoading(true);

      if (!user) {
        toast.error("User information is missing.");
        return;
      }

      const payload = {
        ...data,
        created_by: {
          id: user.id,
          name: user.full_name,
          role: user.role,
          email: user.email,
        },
        type: type
      };

      const response = await createReport(payload);

      if (response.success) {
        toast.success("Report sent successfully!");
      } else {
        toast.error(response.message || "Failed to send report.");
      }

      return response.success;
    } catch (error) {
      toast.error(`Failed to send report. ${error.message}`);
      return false;
    } finally {
      setValue("title", "");
      setValue("description", "");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="text-center">
              <strong className="font-bold text-2xl">
                Report
              </strong>
              <p className="font-thin my-3"> Please provide the details below.</p>
            </div>
          </DialogTitle>
          <DialogDescription className="border rounded-xl text-left p-3 flex flex-col gap-5">
            {["title", "description"].map((field) => (
              <div key={field}>
                <Label htmlFor={field}>{field.replace("_", " ").toUpperCase()}</Label>
                {field === "description" ? (
                  <textarea
                    id={field}
                    {...register(field as keyof ReportFormData)}
                    className="border w-full h-32 p-2"
                  />
                ) : (
                  <Input
                    id={field}
                    className="border"
                    {...register(field as keyof ReportFormData)}
                    type="text"
                  />
                )}
                {errors[field as keyof ReportFormData] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[field as keyof ReportFormData]?.message}
                  </p>
                )}
              </div>
            ))}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 w-full">
          <DialogClose asChild className="w-full">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild className="w-full">
            <Button type="button" variant="default" onClick={handleSubmit(onSubmit)}>
              Submit
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReportDialog