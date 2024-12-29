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
import { LogOut, Settings, User } from "lucide-react"
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
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-between px-4 py-2 gap-5">
          <Avatar>
            <AvatarImage
              src="teacher_profile_picture.jpg"
              alt="Teacher profile picture"
            />
            <AvatarFallback>MBi</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold">Miroslav Hanisko</span>
            <span className="text-xs text-gray-500">miroslav.hanisko@student.tuke.sk</span>
          </div>
        </div>
        <DropdownMenuItem >
          <Button className="w-full">
            <User /> Profile
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem >
          <Button className="w-full">
            <Settings /> Settings
          </Button>
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem >
          <Button className="w-full">
            <LogOut /> Logout
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
