"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "./ui/button"
import { Headset, LogOut, Settings, User } from "lucide-react"
import { Separator } from "./ui/separator"

export function UserOptions() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer hover:opacity-75">
          <AvatarImage
            src="teacher_profile_picture.jpg"
            alt="Teacher profile picture"
          />
          <AvatarFallback>MBi</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-1">
        <div className="px-2 py-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Miroslav Hanisko</span>
            <span className="text-xs text-gray-500">miroslav.hanisko@student.tuke.sk</span>
          </div>
        </div>
        <Separator className="mb-1" />
        <div className="flex flex-col gap-1">
          <DropdownMenuItem className="cursor-pointer">
            <User /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings /> Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Headset /> Support
          </DropdownMenuItem>
          <Separator />
          <DropdownMenuItem className="cursor-pointer">
            <LogOut /> Logout
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
