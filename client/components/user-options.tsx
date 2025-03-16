"use client";

import React, { useState, useEffect } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Headset, LogOut, Settings, User } from "lucide-react";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { useUserStore } from "@/stores/userStore";

import { createClient } from "@/utils/supabase/client";

export function UserOptions() {
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage
          .from("avatars")
          .download(path);
        if (error) {
          throw error;
        }

        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
      } catch (error) {
        console.log("Error downloading image: ", error);
      }
    }

    if (user?.avatar_url) downloadImage(user.avatar_url);
  }, [user?.avatar_url, supabase]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer hover:opacity-75">
          <AvatarImage
            src={avatarUrl ? avatarUrl : "https://github.com/shadcn.png"}
            alt={user?.full_name}
          />
          <AvatarFallback>{user?.full_name}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-1">
        <div className="px-2 py-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{user?.full_name}</span>
            <span className="text-xs text-gray-500">{user?.username}</span>
          </div>
        </div>
        <Separator className="mb-1" />
        <div className="flex flex-col gap-1">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link className="w-full flex gap-2 items-center" href="/account">
              <User /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings /> Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Headset /> Support
          </DropdownMenuItem>
          <Separator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <form action="/auth/signout" method="post">
              <button type="submit" className="flex items-center gap-2 py-1">
                <LogOut /> Logout
              </button>
            </form>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
