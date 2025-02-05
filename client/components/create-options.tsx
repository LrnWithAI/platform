"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { FilePlus, Plus, SquarePlus, Users } from "lucide-react";
import { Separator } from "./ui/separator";
import ClassDialog from "@/components/class-dialog";

export function CreateOptionsLoggedIn() {
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);

  const toggleClassDialog = () => {
    setIsClassDialogOpen(!isClassDialogOpen);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-purple hover:bg-violet-500 text-white hover:text-white"
          >
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
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                setIsClassDialogOpen(true);
              }}
            >
              <Users /> Class
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog for creating/editing a class */}
      <ClassDialog
        type="create" // Set type as 'create' when adding a new class
        isOpen={isClassDialogOpen}
        onClose={toggleClassDialog}
      />
    </>
  );
}

export function CreateOptionsLoggedOut() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
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
  );
}
