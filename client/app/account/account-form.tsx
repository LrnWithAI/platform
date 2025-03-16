"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "@/schema/account";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUserProfile, updateUserProfile } from "@/actions/userActions";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Avatar from "./avatar";
import { z } from "zod";
import { useLoadingStore } from "@/stores/loadingStore";

type AccountFormValues = z.infer<typeof accountSchema>;

export default function AccountForm({ user }: { user: any }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const setLoading = useLoadingStore((state) => state.setLoading);
  const loading = useLoadingStore((state) => state.loading);

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
    },
  });

  const fetchUserData = async () => {
    setLoading(true);

    const response = await getUserProfile(user?.id);
    if (response.success) {
      const data = response.data;
      setValue("firstName", data?.first_name || "");
      setValue("lastName", data?.last_name || "");
      setValue("username", data?.username || "");
      setValue("website", data?.website || "");
      setValue("phone", data?.phone || "");
      setValue("workplace", data?.workplace || "");
      setValue("bio", data?.bio || "");
      setAvatarUrl(data?.avatar_url || null);
      toast.success("User data fetched successfully.");
    } else {
      toast.error("Error fetching user data.");
    }

    setLoading(false);
  };

  const onSubmit = async (data: AccountFormValues) => {
    setLoading(true);

    const response = await updateUserProfile(user?.id, {
      first_name: data.firstName,
      last_name: data.lastName,
      full_name: `${data.firstName} ${data.lastName}`,
      username: data.username,
      website: data.website,
      phone: data.phone,
      workplace: data.workplace,
      bio: data.bio,
      avatar_url: avatarUrl,
    });

    if (response.success) {
      toast.success("Profile updated successfully!");
    } else {
      toast.error("Error updating profile.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 p-6 shadow-md rounded-lg bg-gray-50 w-3/4 mx-auto mt-10"
    >
      <div>
        <Label className="text-md">Avatar</Label>
        <div className="flex flex-row mt-2">
          <Avatar
            uid={user?.id}
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
            <Input
              {...register("firstName")}
              placeholder="First Name"
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2 w-1/2">
            <Label>Last Name</Label>
            <Input
              {...register("lastName")}
              placeholder="Last Name"
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Username</Label>
          <Input
            {...register("username")}
            placeholder="Username"
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Website</Label>
          <Input
            type="url"
            {...register("website")}
            placeholder="Website"
          />
          {errors.website && (
            <p className="text-sm text-red-500">{errors.website.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            type="tel"
            {...register("phone")}
            placeholder="Phone"
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Workplace</Label>
          <Input
            {...register("workplace")}
            placeholder="Workplace"
          />
          {errors.workplace && (
            <p className="text-sm text-red-500">{errors.workplace.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea
            {...register("bio")}
            placeholder="Bio"
            rows={6}
          />
          {errors.bio && (
            <p className="text-sm text-red-500">{errors.bio.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Update"}
        </Button>
      </div>
    </form>
  );
}
