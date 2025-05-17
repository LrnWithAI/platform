"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

import { type User } from "@supabase/supabase-js";
import { useUserStore } from "@/stores/userStore";
import { useLoadingStore } from "@/stores/loadingStore";
import { createProfile } from "@/actions/authActions";

export default function ClientProvider({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const setUser = useUserStore((state) => state.setUser);
  const loading = useLoadingStore((state) => state.loading);

  useEffect(() => {
    if (user && user.id) {
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

            if (!insertedProfile.role || insertedProfile.role === "") {
              router.push("/account");
              toast.warn("You must set your role!");
            }
          } else {
            setUser(data);

            if (!data.role || data.role === "") {
              router.push("/account");
              toast.warn("You must set your role!");
            }
          }
        } catch (error) {
          console.error("Error loading or creating user profile:", error);
          toast.error("Error loading user profile.");
        }
      };

      getOrCreateProfile(user);
    }
  }, [user, router, supabase, setUser]);

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
