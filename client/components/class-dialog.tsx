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
import { deleteFileFromClassCoverPhoto, uploadFileToClassCoverPhoto } from '@/actions/storageActions';

type ClassFormData = z.infer<typeof ClassSchema>;

const ClassDialog: React.FC<ClassDialogProps> = ({ type, onClose, isOpen, initialData }) => {
  const user = useUserStore((state) => state.user);
  const setLoading = useLoadingStore((state) => state.setLoading);
  const setClasses = useClassStore((state) => state.setClasses);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(ClassSchema),
    defaultValues: {
      title: initialData?.title || "",
      name: initialData?.name || "",
      class_time: initialData?.class_time || "",
      year: initialData?.year || "",
      image: undefined,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      onClose();
      setLoading(true);

      if (!user) {
        toast.error("User information is missing.");
        return;
      }

      let classId = initialData?.id;
      let imageName = initialData?.image?.name || "Default class cover";
      let imageUrl = initialData?.image?.url || "/class_cover.jpg";

      // Ak sa trieda vytvára, najprv ju vytvoríme a získame ID
      if (type === "create") {
        const createResponse = await createClass({
          ...data,
          image: {
            name: "Default class cover",
            url: "/class_cover.jpg",
          },
          created_by: {
            id: user.id,
            name: user.full_name,
            role: user.role,
            email: user.email,
          },
          members: [{ id: user.id, name: user.full_name, role: user.role, email: user.email, username: user.username }],
        });

        if (!createResponse.success) {
          toast.error("Failed to create class.");
          return;
        }

        classId = createResponse.data?.[0].id;
        if (!classId) {
          toast.error("Failed to retrieve class ID.");
          return;
        }
      }

      // Ďalej nahráme obrázok triedy, ak bol nahraný nový buď pri vytváraní alebo editovaní triedy
      if (data.image instanceof File) {

        // Pri editovaní triedy ak existuje obrázok nahraný na supabase, tak ho najprv vymažeme a potom nahráme nový (nebudú duplikáty a stále bude len jeden obrázok)ň
        // Defaultne ma image url hodnotu "/class_cover.jpg", takže ak je obrázok defaultný, tak ho nebudeme mazať pretože nie je na supabase stači len nahratie novy a updatnúť class
        if (imageUrl && imageUrl.includes("https://")) {
          if (imageName) {
            if (classId) {
              await deleteFileFromClassCoverPhoto(imageName, user.id, classId);
            } else {
              toast.error("Class ID is missing.");
            }
          }
        }

        const uploadedUrl = await uploadFileToClassCoverPhoto(data.image, user.id, classId);
        if (uploadedUrl) {
          imageName = data.image.name;
          imageUrl = uploadedUrl;
        }
      }

      // Teraz zaktualizujeme triedu s novými údajmi súboru ak sa nahral nový obrázok
      const updateResponse = await editClass(classId, { ...data, image: { name: imageName, url: imageUrl } });

      if (!updateResponse.success) {
        toast.error("Failed to update class.");
        return;
      }

      toast.success(`Class ${type === "create" ? "created" : "updated"} successfully!`);

      // Aktualizujeme zoznam tried
      const updatedClasses = await getClasses(user.id);
      if (updatedClasses) {
        setClasses(updatedClasses.data);
      }
    } catch (error) {
      toast.error(`An error occurred while ${type === "create" ? "creating" : "updating"} the class.`);
    } finally {
      setValue("title", "");
      setValue("name", "");
      setValue("class_time", "");
      setValue("year", "");
      setValue("image", undefined);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset hodnôt len keď sa dialóg otvorí
    if (isOpen) {
      reset({
        title: initialData?.title || "",
        name: initialData?.name || "",
        class_time: initialData?.class_time || "",
        year: initialData?.year || "",
        image: undefined,
      });
    }
  }, [isOpen, initialData, reset]);


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
            {["title", "name", "class_time", "year"].map((field) => (
              <div key={field}>
                <Label htmlFor={field}>{field.replace("_", " ").toUpperCase()}</Label>
                <Input
                  id={field}
                  className="border"
                  {...register(field as keyof ClassFormData)}
                  type="text"
                />
                {errors[field as keyof ClassFormData] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[field as keyof ClassFormData]?.message}
                  </p>
                )}
              </div>
            ))}

            {/* Pole pre nahratie obrázka */}
            <div>
              <Label htmlFor="image">CLASS COVER PHOTO</Label>
              <Input
                id="image"
                className="border"
                type="file"
                accept="image/*" // Povolenie len obrázkových súborov
                onChange={(e) => {
                  const file = e.target.files?.[0] || undefined;
                  setValue("image", file, { shouldValidate: true }); // Nastavenie hodnoty manuálne
                }}
              />
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image?.message}</p>
              )}
            </div>
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