"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "@/schema/account";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUserProfile, updateUserProfile } from "@/actions/userActions";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
    control,
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
      className="mx-auto mt-8 md:mt-14 p-6 max-w-xl bg-white dark:bg-muted border space-y-4 rounded-lg"
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
            <Controller
              control={control}
              name="firstName"
              render={({ field }) => <Input {...field} />}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2 w-1/2">
            <Label>Last Name</Label>
            <Controller
              control={control}
              name="lastName"
              render={({ field }) => <Input {...field} />}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Username</Label>
          <Controller
            control={control}
            name="username"
            render={({ field }) => <Input {...field} />}
          />
        </div>

        <div className="space-y-2">
          <Label>Website</Label>
          <Controller
            control={control}
            name="website"
            render={({ field }) => <Input type="url" {...field} />}
          />
        </div>

        <div className="space-y-2">
          <Label>Phone</Label>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => <Input type="tel" {...field} />}
          />
        </div>

        <div className="space-y-2">
          <Label>Workplace</Label>
          <Controller
            control={control}
            name="workplace"
            render={({ field }) => <Input {...field} />}
          />
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
