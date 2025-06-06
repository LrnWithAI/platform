"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "./ui/separator";
import { useUserStore } from "@/stores/userStore";
import { ModeToggle } from "./color-mode-switcher";
import GoogleTranslateCustom from "./GoogleTranslateCustom";

export function UserOptions() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer hover:opacity-75">
          <AvatarImage
            src={user?.avatar_url || "https://github.com/shadcn.png"}
            alt={user?.full_name}
          />
          <AvatarFallback>{user?.full_name}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="p-1 min-w-[200px]">
        <div className="px-2 py-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{user?.full_name}</span>
            <span
              className="text-xs text-gray-500 cursor-pointer hover:underline"
              onClick={() => {
                setIsDropdownOpen(false);
                router.push(`/profile/${user?.username}`);
              }}
            >
              {user?.username}
            </span>
          </div>
        </div>
        <Separator className="mb-1" />

        <div className="flex flex-col gap-1">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link className="w-full flex gap-2 items-center" href="/account">
              <User /> Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0">
            <div className="w-full px-2 py-1.5 flex items-center gap-2">
              <GoogleTranslateCustom compact />
              <span className="text-sm">Language</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <>
              <ModeToggle compact />
              <span className="text-sm">Theme</span>
            </>
          </DropdownMenuItem>

          <Separator />

          <DropdownMenuItem asChild className="cursor-pointer">
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 py-1"
                onClick={() => setIsDropdownOpen(false)}
              >
                <LogOut /> Logout
              </button>
            </form>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}