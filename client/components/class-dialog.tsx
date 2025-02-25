'use client';

import React, { useEffect } from 'react';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'react-toastify';
import { createClass, editClass, getClasses } from '@/actions/classActions';
import { useLoadingStore } from '@/stores/loadingStore';
import { useClassStore } from '@/stores/classStore';
import { Button } from './ui/button';
import { ClassDialogProps } from '@/types/class';
import { ClassSchema } from '@/schema/class';

type ClassFormData = z.infer<typeof ClassSchema>;

const ClassDialog: React.FC<ClassDialogProps> = ({ type, onClose, isOpen, initialData }) => {
  const user = useUserStore((state) => state.user);
  const setLoading = useLoadingStore((state) => state.setLoading);
  const setClasses = useClassStore((state) => state.setClasses);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(ClassSchema),
    defaultValues: {
      title: initialData?.title || "",
      name: initialData?.name || "",
      class_time: initialData?.class_time || "",
      year: initialData?.year || "",
      image_url: initialData?.image_url || "",
    },
  });

  const onSubmit = async (data: ClassFormData) => {
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
        ...(type === "create" && {
          members: [{ id: user.id, name: user.full_name, role: user.role, email: user.email }],
        }),
      };

      const response = type === "create" ? await createClass(payload) : await editClass(Number(initialData?.id), payload);

      if (response.success) {
        toast.success(`Class ${type === "create" ? "created" : "updated"} successfully!`);

        const updatedClasses = await getClasses();
        if (updatedClasses) {
          setClasses(updatedClasses.data);
          toast.success("Updated classes loaded successfully!");
        }

        return true;
      } else {
        toast.error(response.message || `Failed to ${type === "create" ? "create" : "update"} class.`);
        return false;
      }
    } catch (error) {
      toast.error(`An error occurred while ${type === "create" ? "creating" : "updating"} the class.`);
      return false;
    } finally {
      setValue("title", "");
      setValue("name", "");
      setValue("class_time", "");
      setValue("year", "");
      setValue("image_url", "");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setValue("title", initialData.title || "");
      setValue("name", initialData.name || "");
      setValue("class_time", initialData.class_time || "");
      setValue("year", initialData.year || "");
      setValue("image_url", initialData.image_url || "");
    }
  }, [initialData, setValue]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="text-center">
              <strong className="font-bold text-2xl">
                {type === "create" ? "Create" : "Edit"} Your Class
              </strong>
              <p className="font-thin my-3">Details of your class</p>
            </div>
          </DialogTitle>
          <DialogDescription className="border rounded-xl text-left p-3 flex flex-col gap-5">
            {["title", "name", "class_time", "year", "image_url"].map((field) => (
              <div key={field}>
                <Label htmlFor={field}> {field.replace("_", " ").toUpperCase()} </Label>
                <Input
                  id={field}
                  className="border"
                  {...register(field as keyof ClassFormData)}
                  type={field === "image_url" ? "file" : "text"}
                />
                {errors[field as keyof ClassFormData] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[field as keyof ClassFormData]?.message}
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
              {type === "create" ? "Create" : "Save"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDialog;