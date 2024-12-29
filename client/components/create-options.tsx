"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button"
import { FilePlus, Plus, SquarePlus, Users } from "lucide-react"
import { Separator } from "./ui/separator"

export function CreateOptions() {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center gap-2 bg-primaryPurple text-white ">
          <Plus /> Create
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-1">
        <div className="flex flex-col gap-1">
          <DropdownMenuItem className="cursor-pointer">
            <FilePlus /> Test
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <SquarePlus /> FlashCards
          </DropdownMenuItem>
          <Separator />
          <DropdownMenuItem className="cursor-pointer">
            <Users /> Class
          </DropdownMenuItem>

        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
