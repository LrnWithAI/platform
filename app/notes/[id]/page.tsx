"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactMarkdown from "react-markdown";

import { Trash2, Eye, EditIcon, CircleAlert, CircleX, Download } from "lucide-react";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReportDialog from "@/components/report_dialog";
import { deleteNote, getNoteById, updateNote } from "@/actions/notesActions";
import { uploadFileToNotesBucket, deleteFileFromNotesBucket } from "@/actions/storageActions";
import { noteSchema } from "@/schema/note";
import { useUserStore } from "@/stores/userStore";
import { useLoadingStore } from "@/stores/loadingStore";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { NotePDFDocument } from '@/components/pdf/NotePDFDocument';

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

type NoteFormInputs = z.infer<typeof noteSchema>;

export default function NoteDetail() {
  const params = useParams();
  const id = typeof params.id === "string" ? parseInt(params.id, 10) : undefined;
  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const loading = useLoadingStore((state) => state.loading);
  const setLoading = useLoadingStore((state) => state.setLoading);
  const [note, setNote] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const isAuthor = note?.created_by?.id === user?.id;

  const [currentFiles, setCurrentFiles] = useState<UploadedFile[]>([]); // existujúce, ešte v poznámke
  const [addedFiles, setAddedFiles] = useState<File[]>([]); // nové, neuploadnuté
  const [deletedFiles, setDeletedFiles] = useState<UploadedFile[]>([]); // ktoré existovali a budú zmazané

  const [openReportDialog, setOpenReportDialog] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<NoteFormInputs>({
    resolver: zodResolver(noteSchema),
  });

  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      try {
        if (typeof id !== "number") {
          toast.error("Invalid note ID.");
          setLoading(false);
          return;
        }

        const res = await getNoteById(id);
        if (res.success) {
          const note = res.data;
          setNote(note);

          if (note) {
            setValue("title", note.title);
            setValue("content", note.content);
            setValue("public", note.public ?? false);
            setCurrentFiles(note.files || []);
          }

          setAddedFiles([]);
          setDeletedFiles([]);
        } else {
          toast.error("Failed to fetch note: " + res.message);
        }
      } catch (err) {
        toast.error("Error fetching note");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, setValue]);

  // Pridať nové súbory
  const handleFilesAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setAddedFiles(prev => [...prev, ...selectedFiles]);
  };

  // Odstrániť existujúci (uploaded) súbor – presunieš ho do deletedFiles a odstrániš z currentFiles
  const handleRemoveCurrentFile = (file: UploadedFile) => {
    setCurrentFiles(prev => prev.filter(f => f.id !== file.id));
    setDeletedFiles(prev => [...prev, file]);
  };

  // Odstrániť nový (neuložený) súbor
  const handleRemoveAddedFile = (file: File) => {
    setAddedFiles(prev =>
      prev.filter(
        f => f.name + f.lastModified !== file.name + file.lastModified
      )
    );
  };

  // Submit update
  const onSubmit = async (data: NoteFormInputs) => {
    setLoading(true);

    // 1. Delete files označené na zmazanie
    for (const file of deletedFiles) {
      try {
        if (user?.id) {
          if (id !== undefined) {
            await deleteFileFromNotesBucket(file.name, user.id, id);
          } else {
            toast.error("Note ID is missing. Cannot delete file.");
          }
        } else {
          toast.error("User ID is missing. Cannot delete file.");
        }
      } catch {
        toast.error(`Failed to delete file: ${file.name}`);
      }
    }

    // 2. Uploadni nové files a priprav ich do finálneho array
    let uploadedFiles: UploadedFile[] = [];
    try {
      for (const file of addedFiles) {
        if (user?.id) {
          if (id !== undefined) {
            const publicUrl = await uploadFileToNotesBucket(file, user.id, id);
            if (publicUrl) {
              uploadedFiles.push({
                id: file.name + file.lastModified,
                name: file.name,
                size: file.size,
                type: file.type,
                url: publicUrl,
              });
            }
          } else {
            toast.error("Note ID is missing. Cannot upload file.");
          }
        }
      }
    } catch {
      toast.error("File upload failed.");
    }

    // 3. Finálny files array: všetky zostávajúce (current) + novo uploadnuté
    const allFiles = [...currentFiles, ...uploadedFiles];

    // 4. Update poznámky
    const payload = {
      ...data,
      id,
      created_at: new Date(data.created_at || Date.now()).toISOString(),
      updated_at: new Date().toISOString(),
      created_by: {
        id: String(user?.id),
        name: user?.full_name || "",
        role: user?.role || "",
        email: user?.email || "",
        username: user?.username || "",
      },
      files: allFiles,
    };
    const res = await updateNote(payload);

    if (res.success) {
      toast.success("Note updated successfully!");
      setIsEditMode(false);
      setDeletedFiles([]);
      setAddedFiles([]);

      // Re-fetch note
      if (id === undefined) {
        toast.error("Note ID is missing. Cannot fetch note.");
        return;
      }

      const fresh = await getNoteById(id);
      setNote(fresh.data);

      if (fresh.data) {
        setCurrentFiles(fresh.data?.files);
        setValue("title", fresh.data.title);
        setValue("content", fresh.data.content);
        setValue("public", fresh.data.public ?? false);
      }
    } else {
      toast.error(res.message || "Failed to update note.");
    }
    setLoading(false);
  };

  // Delete note
  const onDeleteNote = async () => {
    if (!user?.id) {
      toast.error("User ID is missing. Cannot delete note.");
      return;
    }
    const res = await deleteNote(note.id, user.id);
    if (res.success) {
      toast.success("Note deleted successfully!");
      router.push("/library");
    } else {
      toast.error(res.message || "Failed to delete note.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[60vh] justify-center py-10 mx-4 mb-20">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-row justify-end space-x-2">
          {isAuthor && !isEditMode && (
            <Button onClick={() => setIsEditMode(true)} variant="outline">
              <EditIcon size={16} />
            </Button>
          )}
          {isEditMode && (
            <Button onClick={() => setIsEditMode(false)} variant="outline">
              <CircleX size={16} />
            </Button>
          )}
          {isAuthor && (
            <Button onClick={onDeleteNote} variant="destructive">
              <Trash2 size={16} />
            </Button>
          )}
          {note && user && (
            <PDFDownloadLink
              document={<NotePDFDocument note={note} user={user} />}
              fileName={`note-${id}.pdf`}
            >
              {({ loading }) => (
                <Button variant="outline">
                  <Download size={16} />
                </Button>
              )}
            </PDFDownloadLink>
          )}
          <Button onClick={() => setOpenReportDialog(true)} variant="outline">
            <CircleAlert size={16} />
          </Button>
        </div>
      </div>

      {!isEditMode && note && (
        <div className="max-w-4xl mt-8 w-full bg-sidebar rounded-lg p-8 shadow border">
          <h2 className="text-2xl font-bold mb-2">{note.title}</h2>
          <div className="mb-4 space-y-4">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <p className="text-base leading-relaxed mb-4" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-6 mb-2" {...props} />,
                li: ({ node, ...props }) => <li className="list-disc ml-6 mb-1" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-black dark:text-white" {...props} />,
                ul: ({ node, ...props }) => <ul className="mb-4" {...props} />,
              }}
            >
              {note.content}
            </ReactMarkdown>
          </div>
          {note.files && note.files.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Attachments:</h3>
              <ul className="space-y-4">
                {note.files.map((file: UploadedFile) => (
                  <li key={file.id} className="flex flex-col gap-2 border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[160px] font-medium">{file.name}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    {/* Inline preview obrázka */}
                    {file.type.startsWith("image/") && (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="max-h-[260px] rounded border shadow mb-2"
                        style={{ objectFit: "contain" }}
                      />
                    )}
                    {/* Inline preview PDF */}
                    {file.type === "application/pdf" && (
                      <iframe
                        src={file.url}
                        title={file.name}
                        className="w-full h-80 rounded border shadow"
                      />
                    )}
                    {/* Pre iné typy */}
                    {!file.type.startsWith("image/") && file.type !== "application/pdf" && (
                      <span className="italic text-gray-500 text-xs">
                        (Preview not supported)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {note.created_at && (
            <p className="mt-6 text-sm text-gray-500">
              Created at: {new Date(note.created_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {isEditMode && (
        <>
          <div className="mb-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-center mb-2">
              Edit Note
            </h2>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-sidebar border rounded-xl p-8 space-y-6 shadow-md w-full max-w-4xl"
          >
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                type="text"
                placeholder="Enter a title"
                {...register("title")}
                disabled={loading}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">Content</Label>
              <textarea
                id="note-content"
                placeholder="Write your note here..."
                className="border rounded-lg p-2 w-full min-h-[120px] resize-y"
                {...register("content")}
                disabled={loading}
              />
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                id="public"
                type="checkbox"
                {...register("public")}
                className="w-5 h-5 cursor-pointer"
                disabled={loading}
              />
              <Label htmlFor="public" className="cursor-pointer">Make public</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-file">Attachments</Label>
              <Input
                id="note-file"
                type="file"
                multiple
                onChange={handleFilesAdd}
                disabled={loading}
              />
              {/* Uploaded files */}
              {currentFiles.length > 0 && (
                <>
                  <h3 className="mb-1 mt-2">Uploaded Files</h3>
                  <ul className="space-y-2">
                    {currentFiles.map(file => (
                      <li key={file.id} className="flex items-center justify-between border p-2 rounded-lg bg-white dark:bg-black">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="truncate max-w-[120px]">{file.name}</span>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Preview"
                            className="text-gray-600 hover:text-purple-700"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                          <span className="text-xs text-gray-400 ml-2">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveCurrentFile(file)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {/* New files */}
              {addedFiles.length > 0 && (
                <>
                  <h3 className="mb-1 mt-2">New Files</h3>
                  <ul className="space-y-2">
                    {addedFiles.map(file => (
                      <li key={file.name + file.lastModified} className="flex items-center justify-between border p-2 rounded-lg bg-white dark:bg-black">
                        <span className="truncate">{file.name}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveAddedFile(file)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {isAuthor && (
              <div className="flex justify-end mt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Update Note"}
                </Button>
              </div>
            )}
          </form>
        </>
      )}

      {/* Report dialog */}
      <ReportDialog
        type="note"
        content_id={Number(id)}
        isOpen={openReportDialog}
        onClose={() => setOpenReportDialog(false)}
      />
    </div >
  );
}