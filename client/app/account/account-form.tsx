"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import Avatar from "./avatar";

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`full_name, username, website, avatar_url`)
        .eq("id", user?.id)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      if (data) {
        setFullname(data.full_name);
        setFirstName(data.full_name.split(" ")[0]);
        setLastName(data.full_name.split(" ")[1]);
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
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

  async function updateProfile({
    username,
    fullname,
    firstName,
    lastName,
    website,
    avatar_url,
  }: {
    username: string | null;
    fullname: string | null;
    firstName: string | null;
    lastName: string | null;
    website: string | null;
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);

      const { error } = await supabase.from("profiles").upsert({
        id: user?.id as string,
        full_name: fullname,
        first_name: firstName,
        last_name: lastName,
        username,
        website,
        avatar_url,
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
    <div className="mx-auto mt-8 md:mt-14 p-6 max-w-xl bg-white dark:bg-muted border space-y-4 rounded-lg">
      <div>
        <Label className="text-md">Avatar</Label>
        <div className="flex flex-row mt-2">
          <Avatar
            uid={user?.id ?? null}
            url={avatar_url}
            size={100}
            onUpload={(url) => {
              setAvatarUrl(url);
              updateProfile({
                fullname,
                username,
                firstName,
                lastName,
                website,
                avatar_url,
              });
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
            <Input
              id="firstName"
              type="text"
              value={firstName || ""}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2 w-1/2">
            <Label htmlFor="firstName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName || ""}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username || ""}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={website || ""}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </div>

      {/* Buttons Section */}
      <div className="flex justify-end pt-4">
        <Button
          className={`bg-purple hover:bg-violet-500 text-white hover:text-white ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() =>
            updateProfile({
              username,
              fullname: `${firstName} ${lastName}`,
              firstName,
              lastName,
              website,
              avatar_url,
            })
          }
          disabled={loading}
        >
          {loading ? "Loading ..." : "Update"}
        </Button>
      </div>
    </div>
  );
}
