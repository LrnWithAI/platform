"use client";

import CreateNoteManually from "@/components/CreateNoteManually";
import CreateNoteWithAI from "@/components/CreateNoteWithAI";
import { useSearchParams } from "next/navigation";

export default function CreateNotes() {
  const params = useSearchParams();
  const option = params.get("option");

  if (option === "withAI") {
    return <CreateNoteWithAI />;
  } else {
    return <CreateNoteManually />;
  }
}