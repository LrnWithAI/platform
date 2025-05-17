'use client';

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "@/schema/account";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUserProfile, updateUserProfile } from "@/actions/userActions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Avatar from "./avatar";
import { useLoadingStore } from "@/stores/loadingStore";
import { User } from "@/types/user";
import { Trash2 } from "lucide-react";
import { deleteFileFromUser, uploadFileToUser } from "@/actions/storageActions";

// Typ pre existujúci súbor, ktorý obsahuje URL
type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

type AccountFormValues = z.infer<typeof accountSchema>;

export default function AccountForm({ user }: { user: User }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const setLoading = useLoadingStore((state) => state.setLoading);
  const loading = useLoadingStore((state) => state.loading);
  const isStudent = user?.role === "student";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      website: "",
      phone: "",
      workplace: "",
      bio: "",
      whatIDo: "",
      announcements: "",
      role: undefined
    },
  });

  // Pôvodné existujúce súbory 
  const [initialFiles, setInitialFiles] = useState<UploadedFile[]>([]);
  // Stav pre súbory – nový aj existujúce
  const [files, setFiles] = useState<(File | UploadedFile)[]>([]);

  const fetchUserData = useCallback(async () => {
    setLoading(true);

    if (!user?.id) {
      toast.error("User ID is missing.");
      setLoading(false);
      return;
    }

    const response = await getUserProfile(user.id);

    if (response.success) {
      const data = response.data;
      setValue("firstName", data?.first_name || "");
      setValue("lastName", data?.last_name || "");
      setValue("username", data?.username || "");
      setValue("website", data?.website || "");
      setValue("phone", data?.phone || "");
      setValue("workplace", data?.workplace || "");
      setValue("bio", data?.bio || "");
      setValue("whatIDo", data?.whatIDo || "");
      setValue("announcements", data?.announcements || "");
      setValue("role", data?.role || "");
      setAvatarUrl(data?.avatar_url || null);

      if (data?.files) {
        setInitialFiles(data.files);
        setFiles(data.files);
      }

      toast.success("User data fetched successfully.");
    } else {
      toast.error("Error fetching user data.");
    }

    setLoading(false);
  }, [user?.id, setLoading, setValue]);

  const onSubmit = async (data: AccountFormValues) => {
    setLoading(true);

    // Aktualizácia profilu bez príloh
    const updateData = {
      first_name: data.firstName,
      last_name: data.lastName,
      full_name: `${data.firstName} ${data.lastName}`,
      username: data.username,
      website: data.website,
      phone: data.phone,
      workplace: data.workplace,
      bio: data.bio,
      avatar_url: avatarUrl,
      whatIDo: data.whatIDo,
      announcements: data.announcements,
      role: data.role,
    };

    if (!user?.id) {
      toast.error("User ID is missing.");
      setLoading(false);
      return;
    }

    const response = await updateUserProfile(user.id, updateData);
    if (!response.success) {
      toast.error(response.message);
      setLoading(false);
      return;
    }

    // Rozlíšenie nových súborov (inštancie File) a existujúcich (UploadedFile)
    const newFiles = files.filter((file) => file instanceof File) as File[];
    const deletedFiles = initialFiles.filter((oldFile) =>
      !files.some(
        (file) =>
          !(file instanceof File) && (file as UploadedFile).id === oldFile.id
      )
    );

    // Mazanie odstránených súborov z databázy
    for (const file of deletedFiles) {
      const delRes = await deleteFileFromUser(file.name, user.id);
      if (!delRes?.success) {
        toast.error(`Error deleting file: ${file.name}`);
      }
    }
    if (deletedFiles.length > 0) {
      toast.success("Files deleted successfully!");
    }

    // Upload nových súborov a získanie URL
    if (newFiles.length > 0) {
      try {
        const uploadedFiles: UploadedFile[] = [];
        for (const file of newFiles) {
          const publicUrl = await uploadFileToUser(file, user.id);
          if (publicUrl) {
            uploadedFiles.push({
              id: file.name + file.lastModified,
              name: file.name,
              size: file.size,
              type: file.type,
              url: publicUrl,
            });
          }
        }
        // Zachovanie existujúcich nahratých súborov
        const remainingFiles = files.filter(
          (file) => !(file instanceof File)
        ) as UploadedFile[];
        const updatedFiles = [...remainingFiles, ...uploadedFiles];

        const fileUpdateRes = await updateUserProfile(user.id, {
          files: updatedFiles,
        });
        if (fileUpdateRes?.success) {
          toast.success("Files uploaded and saved successfully!");
          // Aktualizácia stavu – nová verzia súborov sa uloží do stavu
          setInitialFiles(updatedFiles);
          setFiles(updatedFiles as (File | UploadedFile)[]);
        } else {
          toast.error("Failed to update file attachments");
        }
      } catch (error) {
        console.error("Error uploading files:", error);
        toast.error("An error occurred while uploading files.");
      }
    } else if (deletedFiles.length > 0) {
      // Ak došlo len k odstráneniu, updatni profil s existujúcimi súbormi
      const remainingFiles = files.filter(
        (file) => !(file instanceof File)
      );
      const fileUpdateRes = await updateUserProfile(user.id, {
        files: remainingFiles,
      });
      if (fileUpdateRes?.success) {
        toast.success("Profile updated with remaining files successfully!");
        setInitialFiles(remainingFiles as UploadedFile[]);
        setFiles(remainingFiles as (File | UploadedFile)[]);
      } else {
        toast.error("Failed to update file attachments");
      }
    } else {
      toast.success("Profile updated successfully!");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 p-6 shadow-xl rounded-lg bg-sidebar 0 w-3/4 mx-auto mt-10"
    >
      <div>
        <Label className="text-md">Avatar</Label>
        <div className="flex flex-row mt-2">
          <Avatar
            uid={user?.id ?? null}
            url={avatarUrl}
            size={100}
            onUpload={(url) => setAvatarUrl(url)}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="space-y-2 w-1/2">
            <Label>First Name</Label>
            <Input {...register("firstName")} placeholder="First Name" />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2 w-1/2">
            <Label>Last Name</Label>
            <Input {...register("lastName")} placeholder="Last Name" />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <select
            {...register("role")}
            className="w-full px-3 py-2 border rounded-md bg-white text-black"
            disabled={isStudent} // znemožní zmenu
          >
            <option value="">Select role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Username</Label>
          <Input {...register("username")} placeholder="Username" />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Website</Label>
          <Input type="url" {...register("website")} placeholder="Website" />
          {errors.website && (
            <p className="text-sm text-red-500">{errors.website.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Phone</Label>
          <Input type="tel" {...register("phone")} placeholder="Phone" />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Workplace</Label>
          <Input {...register("workplace")} placeholder="Workplace" />
          {errors.workplace && (
            <p className="text-sm text-red-500">{errors.workplace.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea {...register("bio")} placeholder="Bio" rows={6} />
          {errors.bio && (
            <p className="text-sm text-red-500">{errors.bio.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>What I Do</Label>
        <Textarea {...register("whatIDo")} placeholder="What I Do" rows={6} />
        {errors.whatIDo && (
          <p className="text-sm text-red-500">{errors.whatIDo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Announcements</Label>
        <Textarea
          {...register("announcements")}
          placeholder="Announcements"
          rows={6}
        />
        {errors.announcements && (
          <p className="text-sm text-red-500">{errors.announcements.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Files</Label>
        <Input
          id="file"
          type="file"
          multiple
          onChange={(e) => {
            const selectedFiles = Array.from(e.target.files || []);
            // Pridáme vybrané súbory priamo ako File objekty
            setFiles((prev) => [...prev, ...selectedFiles]);
          }}
        />

        {files.length > 0 && (
          <div>
            {files.filter((file) => !(file instanceof File)).length > 0 && (
              <>
                <h3 className="mb-1 mt-2">Existing Files</h3>
                <ul className="mt-2 space-y-2">
                  {(files.filter(
                    (file) => !(file instanceof File)
                  ) as UploadedFile[]).map((file) => (
                    <li
                      key={file.id}
                      className="flex items-center justify-between border p-2 rounded-lg bg-white dark:bg-black"
                    >
                      <span className="truncate">{file.name}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setFiles((prev) =>
                            prev.filter((f) =>
                              !(f instanceof File)
                                ? (f as UploadedFile).id !== file.id
                                : true
                            )
                          );
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {files.filter((file) => file instanceof File).length > 0 && (
              <>
                <h3 className="mb-1 mt-2">New Files</h3>
                <ul className="mt-2 space-y-2">
                  {(files.filter((file) => file instanceof File) as File[]).map(
                    (file) => (
                      <li
                        key={file.name + file.lastModified}
                        className="flex items-center justify-between border p-2 rounded-lg"
                      >
                        <span className="truncate">{file.name}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setFiles((prev) =>
                              prev.filter((f) =>
                                f instanceof File
                                  ? f.name + f.lastModified !==
                                  file.name + file.lastModified
                                  : true
                              )
                            );
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </li>
                    )
                  )}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Update"}
        </Button>
      </div>
    </form>
  );
}