"use client";

import { useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from '@/stores/userStore';
import { type User } from "@supabase/supabase-js";
import { toast } from 'react-toastify';

export default function ClientProvider({ user, children }: { user: User, children: React.ReactNode }) {
  const supabase = createClient();
  const setUser = useUserStore((state) => state.setUser);

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

  return <>{children}</>;
}
