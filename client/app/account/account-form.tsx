"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "@/schema/account";
import { useForm } from "react-hook-form";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Avatar from "./avatar";

type AccountFormValues = z.infer<typeof accountSchema>;

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient();
  const [fetchedUser, setFetchedUser] = useState<AccountFormValues>();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      firstName: user?.user_metadata.firstName ?? "",
      lastName: user?.user_metadata.lastName ?? "",
      username: fetchedUser?.username ?? "",
      website: fetchedUser?.website ?? "",
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    console.log("submitted data", data);
    await updateProfile(data);
  };

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`*`)
        .eq("id", user?.id)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      if (data) {
        setFetchedUser({
          ...data,
        });
        setAvatarUrl(data.avatar_url);
        setValue("username", data.username);
        setValue("website", data.website);
      }
    } catch (error) {
      alert("Error loading user data!");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

  async function updateProfile(data: AccountFormValues) {
    try {
      setLoading(true);

      const { error } = await supabase.from("profiles").upsert({
        id: user?.id as string,
        full_name: `${data.firstName} ${data.lastName}`,
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        website: data.website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.success("Error updating the data!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto mt-8 md:mt-14 p-6 max-w-xl bg-white dark:bg-muted border space-y-4 rounded-lg"
    >
      <div>
        <Label className="text-md">Avatar</Label>
        <div className="flex flex-row mt-2">
          <Avatar
            uid={user?.id ?? null}
            url={avatarUrl}
            size={100}
            onUpload={(url) => {
              setAvatarUrl(url);
            }}
          />
        </div>
      </div>

      {/* Form Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={user?.email} disabled />
        </div>

        <div className="flex flex-row gap-4">
          <div className="flex flex-col space-y-2 w-1/2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" type="text" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="flex flex-col space-y-2 w-1/2">
            <Label htmlFor="firstName">Last Name</Label>
            <Input id="lastName" type="text" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" {...register("username")} />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" type="url" {...register("website")} />
          {errors.website && (
            <p className="text-sm text-red-500">{errors.website.message}</p>
          )}
        </div>
      </div>

      {/* Buttons Section */}
      <div className="flex justify-end pt-4">
        <Button
          className={`bg-purple hover:bg-violet-500 text-white hover:text-white ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
          type="submit"
        >
          {loading ? "Loading ..." : "Update"}
        </Button>
      </div>
    </form>
  );
}
