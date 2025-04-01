"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getNoteById } from "@/actions/notesActions";
import { Note } from "@/types/note";
import { useLoadingStore } from "@/stores/loadingStore";

const NoteDetail = () => {
  const params = useParams();
  const id = params.id;
  const [note, setNote] = useState<Note | null>(null);
  const setLoading = useLoadingStore((state) => state.setLoading);
  const loading = useLoadingStore((state) => state.loading);

  const fetchNote = async () => {
    setLoading(true);
    try {
      const res = await getNoteById(id);
      if (res.success) {
        setNote(res.data);
      } else {
        console.error("Failed to fetch note:", res.message);
      }
    } catch (error) {
      console.error("Error fetching note", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);

  return (
    <div className="flex flex-col justify-center items-center p-4">
      <h1 className="text-2xl font-bold">Note Detail</h1>
      <p className="text-lg font-semibold">Note ID: {id}</p>
      {loading && <p>Loading note details...</p>}
      {note && (
        <div className="mt-4 max-w-2xl">
          <h2 className="text-xl font-bold">{note.title}</h2>
          <p className="mt-2">{note.content}</p>
          {note.created_at && (
            <p className="mt-2 text-sm text-gray-500">
              Created at: {new Date(note.created_at).toLocaleString()}
            </p>
          )}
        </div>
      )}
      {!loading && !note && <p>Note not found.</p>}
    </div>
  );
};

export default NoteDetail;
