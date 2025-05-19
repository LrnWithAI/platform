"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ClipboardPlus, FilePlus, Plus, SquarePlus, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ClassDialog from "@/components/class-dialog";
import { CreateTestDialog, CreateFlashcardsDialog, CreateNotesDialog } from "@/components/create-test-dialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useUserStore } from "@/stores/userStore";

export function CreateOptionsLoggedIn() {
  const user = useUserStore((state) => state.user);

  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isFlashcardsDialogOpen, setIsFlashcardsDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
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
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                setIsDropdownOpen(false);
                setIsTestDialogOpen(true);
              }}
            >
              <FilePlus /> Test
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                setIsDropdownOpen(false);
                setIsFlashcardsDialogOpen(true);
              }}
            >
              <SquarePlus /> FlashCards
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                setIsDropdownOpen(false);
                setIsNotesDialogOpen(true);
              }}
            >
              <ClipboardPlus /> Notes
            </DropdownMenuItem>
            {user?.role === "teacher" && (
              <>
                <Separator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsDropdownOpen(false);
                    setIsClassDialogOpen(true);
                  }}
                >
                  <Users /> Class
                </DropdownMenuItem>
              </>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTestDialog
        isOpen={isTestDialogOpen}
        onClose={() => {
          setIsTestDialogOpen(false);
          setIsDropdownOpen(false);
        }}
        isInMenu={true}
      />

      <CreateFlashcardsDialog
        isOpen={isFlashcardsDialogOpen}
        onClose={() => {
          setIsFlashcardsDialogOpen(false);
          setIsDropdownOpen(false);
        }}
        isInMenu={true}
      />

      <CreateNotesDialog
        isOpen={isNotesDialogOpen}
        onClose={() => {
          setIsNotesDialogOpen(false);
          setIsDropdownOpen(false);
        }}
        isInMenu={true}
      />

      {/* Dialog for creating/editing a class */}
      <ClassDialog
        type="create"
        isOpen={isClassDialogOpen}
        onClose={() => {
          setIsClassDialogOpen(false);
          setIsDropdownOpen(false);
        }}
      />
    </>
  );
}

export function CreateOptionsLoggedOut() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Plus /> Create
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-1">
        <div className="flex flex-col gap-1">
          <DropdownMenuItem
            onClick={() => router.push("/login")}
            className="cursor-pointer"
          >
            <FilePlus /> Test
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/login")}
            className="cursor-pointer"
          >
            <SquarePlus /> FlashCards
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/login")}
            className="cursor-pointer"
          >
            <ClipboardPlus /> Notes
          </DropdownMenuItem>
          <Separator />
          <DropdownMenuItem
            onClick={() => router.push("/login")}
            className="cursor-pointer"
          >
            <Users /> Class
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}