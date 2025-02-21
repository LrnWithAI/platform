"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { LoaderCircle } from "lucide-react";

import { type User } from "@supabase/supabase-js";
import { useUserStore } from "@/stores/userStore";
import { useLoadingStore } from "@/stores/loadingStore";
import { toast } from "react-toastify";

export default function ClientProvider({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const setUser = useUserStore((state) => state.setUser);
  const loading = useLoadingStore((state) => state.loading);

  console.log("data", user);

  const getProfile = async () => {
    try {
      const { data, error, status } = await supabase
        .from("profiles")
        .select(`*`)
        .eq("id", user?.id)
        .single();

      if (error && status !== 406) {
        toast.error(error.message);
        throw error;
      }

      if (data) {
        setUser(data);
      }
    } catch (error) {
      alert("Error loading user data!");
    }
  };

  useEffect(() => {
    getProfile();
  }, [user, setUser]);

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
