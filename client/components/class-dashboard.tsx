'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CircleAlert, CirclePlus, Trash2, EditIcon, EllipsisVertical, Download } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClassStore } from '@/stores/classStore';
import { useLoadingStore } from '@/stores/loadingStore';
import { getClasses, editClass } from '@/actions/classActions';
import { toast } from 'react-toastify';
import { useUserStore } from '@/stores/userStore';
import ReportDialog from './report_dialog';
import { formatDate } from '@/utils/supabase/utils';
import { downloadImage, updateClassContent, uploadFilesToClassContent, deleteFileFromClassContent } from '@/actions/storageActions';

const ClassDashboard = () => {
  const params = useParams();
  const id = params.id;

  const classData = useClassStore((state) => state.classes.find((c) => c.id === Number(id)));
  const setClasses = useClassStore((state) => state.setClasses);
  const setLoading = useLoadingStore((state) => state.setLoading);
  const user = useUserStore((state) => state.user);

  const isTeacher = classData?.members.some((member) => member.role === 'teacher' && member.id === user?.id);

  const [postData, setPostData] = useState<{ id: number | null, title: string, content: string, files: File[], created_at: Date, updated_at: Date }>({ id: null, title: '', content: '', files: [], created_at: new Date(), updated_at: new Date() });
  const [isEditing, setIsEditing] = useState(false);
  const [openPostDialog, setOpenPostDialog] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const postSettings = [
    { label: 'Edit', value: 'edit', icon: EditIcon },
    { label: 'Delete', value: 'delete', icon: Trash2 },
    { label: 'Report', value: 'report', icon: CircleAlert },
  ];

  useEffect(() => {
    const fetchAvatar = async () => {
      if (user?.avatar_url) {
        const res = await downloadImage(user.avatar_url);
        if (res.success) {
          setAvatarUrl(res.data);
        }
      }
    };

    fetchAvatar();
  }, [user?.avatar_url]);

  const handleUpdateClass = async (updatedContent) => {
    if (!classData) return;

    try {
      setLoading(true);
      const updatedClass = { ...classData, content: updatedContent };
      const response = await editClass(classData.id, updatedClass);

      if (response.success) {
        toast.success(isEditing ? 'Post updated successfully!' : 'Post added successfully!');
        const updatedClasses = await getClasses();
        setClasses(updatedClasses.data);
      } else {
        toast.error(response.message || 'Failed to update class.');
      }
    } catch (error) {
      toast.error('An error occurred while updating the class.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostSettings = (action: string, post: any) => {
    switch (action) {
      case 'edit':
        setPostData(post);
        setIsEditing(true);
        setOpenPostDialog(true);
        break;
      case 'delete':
        handleDeletePost(post.id);
        break;
      case 'report':
        setOpenReportDialog(true);
        break;
      default:
        break;
    }
  };

  const handleSavePost = async () => {
    if (!classData) return;
    setOpenPostDialog(false);
    setLoading(true);

    const generatedId = isEditing ? postData.id : Date.now();

    // Oddelenie existujúcich a nových súborov
    const existingFiles = postData.files.filter(file => file.url);  // Existujúce súbory (majú URL)
    const newFiles = postData.files.filter(file => !file.url);      // Nové súbory (inštancie File)

    const preparedPostData = {
      ...postData,
      id: generatedId,
      created_at: isEditing ? postData.created_at : new Date(),
      updated_at: new Date(),
      created_by: user,
      files: existingFiles,  // Na začiatku len existujúce súbory
    };

    const updatedContent = isEditing
      ? classData.content.map((post) => (post.id === postData.id ? { ...post, title: preparedPostData.title, content: preparedPostData.content, updated_at: new Date(), files: preparedPostData.files } : post))
      : [...classData.content, preparedPostData];

    await handleUpdateClass(updatedContent);

    //ak sa vymazali súbory z príspevku tak ich treba vymazať aj z databazy po jednom cez map
    if (isEditing) {
      const deletedFiles = classData.content.find(post => post.id === postData.id)?.files.filter(file => !postData.files.some(f => f.name === file.name));

      let res;
      for (const file of deletedFiles) {
        res = await deleteFileFromClassContent(user.id, classData.id, generatedId, file.name);
      }
      if (res?.success) toast.success("Files deleted successfully!");
    }

    // Ak boli nahrané nové súbory, tak ich nahrajeme do bucketu a pridáme do triedy
    if (newFiles.length > 0) {
      if (!user) {
        toast.error("User is not logged in.");
        setLoading(false);
        return;
      }

      try {
        const uploadedFiles = await uploadFilesToClassContent(newFiles, user.id, classData.id, generatedId as number);;

        if (uploadedFiles.length > 0) {
          const res = await updateClassContent(classData.id, generatedId, [...existingFiles, ...uploadedFiles]); // pošleme existujúce prílohy ale aj nové, ktoré sa práve nahrali aby ich updatlo do triedy 

          if (res?.success) {
            res.data ? setClasses(res.data) : toast.error("Failed to update class content");
            toast.success("Files uploaded and saved successfully!");
          } else {
            toast.error("Failed to update class content");
          }
        }
      } catch (error) {
        toast.error("An error occurred while uploading files.");
      }
    }

    // Resetovanie stavu
    setPostData({ id: null, title: "", content: "", files: [], created_at: new Date(), updated_at: new Date() });
    setIsEditing(false);
    setLoading(false);
  };

  const handleDeletePost = async (postId: number) => {
    if (!classData) return;
    setLoading(true);

    // Vymaže všetky súbory z bucketu pre vymazaný príspevok, tým sa vymaže aj folder z bucketu lebo ostane prázdny
    const deletedFiles = classData.content.find(post => post.id === postId)?.files;
    let res;
    for (const file of deletedFiles) {
      res = await deleteFileFromClassContent(user.id, classData.id, postId, file.name);
    }
    if (res?.success) toast.success("Files deleted successfully from the post!");

    // Aktualizuje triedu bez daného vymazaného príspevku
    const updatedContent = classData.content.filter((post) => post.id !== postId);
    await handleUpdateClass(updatedContent);

    toast.success('Post deleted successfully!');
    setLoading(false);
  };

  const handleDownloadFileFromPost = async (url, fileName) => {
    const response = await fetch(url);
    const blob = await response.blob();

    const a = document.createElement('a');
    const urlBlob = window.URL.createObjectURL(blob);

    a.href = urlBlob;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(urlBlob);
  };

  return (
    <div className="space-y-6 relative">
      {isTeacher && (
        <Button className="bg-violet-500 hover:bg-violet-600 text-white absolute right-0 top-[-75px]" onClick={() => {
          setPostData({ id: null, title: '', content: '', files: [], created_at: new Date(), updated_at: new Date() });
          setIsEditing(false);
          setOpenPostDialog(true);
        }}>
          <CirclePlus size={20} /> Add Post
        </Button>
      )}

      <Dialog open={openPostDialog} onOpenChange={setOpenPostDialog}>
        <DialogContent className="max-h-[90%] overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>
              <div className="text-center font-bold text-2xl">
                {isEditing ? 'Edit Post' : 'Add Post'}
              </div>
            </DialogTitle>
            <DialogDescription className="border rounded-xl text-left p-3 flex flex-col gap-5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={postData.title} onChange={(e) => setPostData({ ...postData, title: e.target.value })} />
              <Label htmlFor="content">Content</Label>
              <textarea id="content" value={postData.content} onChange={(e) => setPostData({ ...postData, content: e.target.value })} className="border w-full h-32 p-2" />
              <Label htmlFor="file">Files</Label>
              <Input
                id="file"
                type="file"
                multiple
                onChange={(e) => setPostData({ ...postData, files: [...postData.files, ...Array.from(e.target.files || [])] })}
              />

              {/* Zoznam existujúcich a nových súborov */}
              {postData.files.length > 0 && (
                <div>
                  <h3 className="mb-1 mt-2">Existing Files</h3>
                  <ul className="mt-2 space-y-2">
                    {postData.files.filter(file => file.url).map((file) => (
                      <li key={file.name} className="flex items-center justify-between border p-2 rounded-lg">
                        <span className="truncate">{file.name}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setPostData({
                              ...postData,
                              files: postData.files.filter(f => f !== file), // Porovnáva sa objekt, nie index
                            });
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>

                  <h3 className="mb-1 mt-2">New Files</h3>
                  <ul className="mt-2 space-y-2">
                    {postData.files.filter(file => !file.url).map((file) => (
                      <li key={file.name} className="flex items-center justify-between border p-2 rounded-lg">
                        <span className="truncate">{file.name}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setPostData({
                              ...postData,
                              files: postData.files.filter(f => f !== file), // Odstráni sa presne daný objekt
                            });
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 w-full">
            <DialogClose asChild className="w-full">
              <Button variant="secondary" onClick={() => setOpenPostDialog(false)}>Cancel</Button>
            </DialogClose>
            <DialogClose asChild className="w-full">
              <Button onClick={handleSavePost}>{isEditing ? 'Update' : 'Add'}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        {classData && classData.content?.length > 0 ? (
          classData.content.map((post) => (
            <div className="mt-5 first:mt-0 bg-white rounded-lg shadow-lg p-6 pe-16 relative">
              <div className='flex items-center gap-4'>
                <Avatar className="cursor-pointer hover:opacity-75">
                  <AvatarImage
                    src={avatarUrl || "https://github.com/shadcn.png"}
                    alt={user?.full_name}
                  />
                  <AvatarFallback>{(user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-bold">{post.title}</span>
                  <span className="text-gray-500">{user?.full_name}</span>
                </div>
              </div>

              <div key={post.id} className="flex items-center justify-between border-b pb-3 last:border-none">
                <div>
                  <p className="py-5">{post.content}</p>
                  <p className="text-gray-500">Created at: {formatDate(post.created_at)}</p>
                  <p className="text-gray-500"> Last updated at: {formatDate(post.updated_at)}</p>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <EllipsisVertical className="cursor-pointer absolute right-5 top-9" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[150px] p-0">
                    <Command>
                      <CommandList>
                        <CommandEmpty>Not found</CommandEmpty>
                        <CommandGroup>
                          {postSettings.map((option) => (
                            <CommandItem
                              key={option.label}
                              value={option.value}
                              onSelect={() => handlePostSettings(option.value, post)}
                              className="hover:cursor-pointer"
                            >
                              <option.icon className="mr-2 h-4 w-4" />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {post.files?.map((file) => (
                <div key={file.id} className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-75" onClick={() => { }}>
                    <button
                      onClick={() => handleDownloadFileFromPost(file.url, file.name)}
                      className="flex items-center gap-2 text-blue-600 text-lg font-medium"
                    >
                      <Download className="h-4 w-4" />
                      <p>{file.name}</p>
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-gray-500">Empty dashboard.</p>
        )}
      </div>

      <ReportDialog isOpen={openReportDialog} onClose={() => setOpenReportDialog(false)} type="post" />
    </div>
  );
};

export default ClassDashboard;