import { useState } from "react";
import { CirclePlus } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type TestDialogType = {
  isInMenu?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
};

type FlashcardsDialogType = {
  isInMenu?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
};

type NotesDialogType = {
  isInMenu?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
};

export const CreateTestDialog = ({
  isInMenu,
  isOpen,
  onClose,
}: TestDialogType) => {
  const router = useRouter();
  const [createTestOption, setCreateTestOption] = useState<
    "withAI" | "manually" | ""
  >("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {!isInMenu && (
        <DialogTrigger>
          <CirclePlus size={20} />
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="text-center">
              <strong className="font-bold text-2xl">Create Test</strong>
            </div>
          </DialogTitle>
          <DialogDescription className="flex flex-row gap-5 py-5">
            <div
              className={`border rounded-md flex justify-center items-center align-center w-1/2 hover:cursor-pointer dark:bg-neutral-900 dark:text-white ${
                createTestOption == "withAI"
                  ? "bg-slate-200 dark:bg-neutral-600"
                  : "bg-white"
              }`}
            >
              <button
                className="text-4xl py-24 w-full h-full"
                onClick={() => {
                  setCreateTestOption("withAI");
                }}
              >
                With AI
              </button>
            </div>
            <div
              className={`border rounded-md flex justify-center items-center align-center w-1/2 hover:cursor-pointer dark:bg-neutral-900 dark:text-white ${
                createTestOption == "manually"
                  ? "bg-slate-200 dark:bg-neutral-600"
                  : "bg-white"
              }`}
            >
              <button
                className="text-4xl py-24 w-full h-full"
                onClick={() => {
                  setCreateTestOption("manually");
                }}
              >
                Manually
              </button>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 w-full">
          <DialogClose asChild className="w-full">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild className="w-full">
            <Button
              type="button"
              variant="default"
              disabled={createTestOption == "" ? true : false}
              onClick={() => {
                router.push(`../test/create?option=${createTestOption}`);
              }}
            >
              Ok
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const CreateFlashcardsDialog = ({
  isOpen,
  onClose,
  isInMenu,
}: FlashcardsDialogType) => {
  const router = useRouter();
  const [createFlashcardsOption, setCreateFlashcardsOption] = useState<
    "withAI" | "manually" | ""
  >("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {!isInMenu && (
        <DialogTrigger>
          <CirclePlus size={20} />
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="text-center">
              <strong className="font-bold text-2xl">
                Create Flashcards set
              </strong>
            </div>
          </DialogTitle>
          <DialogDescription className="flex flex-row gap-5 py-5">
            <div
              className={`border rounded-md flex justify-center items-center align-center w-1/2 hover:cursor-pointer dark:bg-neutral-900 dark:text-white ${
                createFlashcardsOption == "withAI"
                  ? "bg-slate-200 dark:bg-neutral-600"
                  : "bg-white"
              }`}
            >
              <button
                className="text-4xl py-24 w-full h-full"
                onClick={() => {
                  setCreateFlashcardsOption("withAI");
                }}
              >
                With AI
              </button>
            </div>
            <div
              className={`border rounded-md flex justify-center items-center align-center w-1/2 hover:cursor-pointer dark:bg-neutral-900 dark:text-white ${
                createFlashcardsOption == "manually"
                  ? "bg-slate-200 dark:bg-neutral-600"
                  : "bg-white"
              }`}
            >
              <button
                className="text-4xl py-24 w-full h-full"
                onClick={() => {
                  setCreateFlashcardsOption("manually");
                }}
              >
                Manually
              </button>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 w-full">
          <DialogClose asChild className="w-full">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild className="w-full">
            <Button
              type="button"
              variant="default"
              disabled={createFlashcardsOption == "" ? true : false}
              onClick={() => {
                router.push(
                  `../flashcards/create?option=${createFlashcardsOption}`
                );
              }}
            >
              Ok
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const CreateNotesDialog = ({
  isOpen,
  onClose,
  isInMenu,
}: NotesDialogType) => {
  const router = useRouter();
  const [createNotesOption, setCreateNotesOption] = useState<
    "withAI" | "manually" | ""
  >("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {!isInMenu && (
        <DialogTrigger>
          <CirclePlus size={20} />
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="text-center">
              <strong className="font-bold text-2xl">Create Notes</strong>
            </div>
          </DialogTitle>
          <DialogDescription className="flex flex-row gap-5 py-5">
            <div
              className={`border rounded-md flex justify-center items-center align-center w-1/2 hover:cursor-pointer dark:bg-neutral-900 dark:text-white ${
                createNotesOption == "withAI"
                  ? "bg-slate-200 dark:bg-neutral-600"
                  : "bg-white"
              }`}
            >
              <button
                className="text-4xl py-24 w-full h-full"
                onClick={() => {
                  setCreateNotesOption("withAI");
                }}
              >
                With AI
              </button>
            </div>
            <div
              className={`border rounded-md flex justify-center items-center align-center w-1/2 hover:cursor-pointer dark:bg-neutral-900 dark:text-white ${
                createNotesOption == "manually"
                  ? "bg-slate-200 dark:bg-neutral-600"
                  : "bg-white"
              }`}
            >
              <button
                className="text-4xl py-24 w-full h-full"
                onClick={() => {
                  setCreateNotesOption("manually");
                }}
              >
                Manually
              </button>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 w-full">
          <DialogClose asChild className="w-full">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild className="w-full">
            <Button
              type="button"
              variant="default"
              disabled={createNotesOption == "" ? true : false}
              onClick={() => {
                router.push(`../notes/create?option=${createNotesOption}`);
              }}
            >
              Ok
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
