"use client";

import { useEffect } from "react";
import { toast } from "react-toastify";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

import { type User } from "@supabase/supabase-js";
import { useUserStore } from "@/stores/userStore";
import { useLoadingStore } from "@/stores/loadingStore";
import { createProfile } from "@/actions/authActions";

export default function ClientProvider({ user, children }: {
  user: User | null;
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const setUser = useUserStore((state) => state.setUser);
  const loading = useLoadingStore((state) => state.loading);

  const getOrCreateProfile = async (user: User) => {
    try {
      const { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error && status !== 406 && status !== 400) {
        toast.error(error.message);
        throw error;
      }

      if (!data) {
        await createProfile(user);

        const { data: insertedProfile, error: readError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (readError || !insertedProfile) {
          toast.error("Profile was created but cannot be read.");
          return;
        }

        setUser(insertedProfile);
      } else {
        setUser(data);
      }

    } catch (error) {
      console.error("Error loading or creating user profile:", error);
      toast.error("Error loading user profile.");
    }
  };

  useEffect(() => {
    if (user && user.id) {
      getOrCreateProfile(user);
    }
  }, [user]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">
            <LoaderCircle size={50} className={cn("animate-spin")} />
          </div>
        </div>
      )}
      {children}
    </>
  );
}
