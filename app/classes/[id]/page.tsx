'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation';
import { CircleAlert, Copy, EllipsisVertical, FilePenLine, SquareMinus, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { useClassStore } from '@/stores/classStore';
import { useLoadingStore } from '@/stores/loadingStore';
import { deleteClass, editClass } from '@/actions/classActions';
import { toast } from 'react-toastify';
import ClassDashboard from '@/components/class-dashboard';
import ClassMembers from '@/components/class-members';
import ClassDialog from '@/components/class-dialog';
import ReportDialog from '@/components/report_dialog';
import ClassFiles from '@/components/class-files';
import { deleteFileFromClassContent } from '@/actions/storageActions';
import { useUserStore } from '@/stores/userStore';

const classSettings = [
  { label: "Edit", value: "edit", icon: FilePenLine },
  { label: "Report", value: "report", icon: CircleAlert },
  { label: "Remove all students", value: "remove_students", icon: SquareMinus },
  { label: "Remove all content", value: "remove_content", icon: SquareMinus },
  { label: "Delete", value: "delete", icon: Trash2 },
]

const Class = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const classData = useClassStore((state) => state.classes.find((c) => c.id === Number(id)));
  const getClassById = useClassStore((state) => state.getClassById);
  const [openClassSettings, setClassSettings] = useState(false)
  const [openMobileClassSettings, setMobileClassSettings] = useState(false)

  const setLoading = useLoadingStore((state) => state.setLoading);

  const user = useUserStore((state) => state.user);
  const isTeacher = classData?.members.some((member) => member.role === 'teacher' && member.id === user?.id);

  const [openDialogs, setOpenDialogs] = useState<{ [key: number]: boolean }>({});
  const [openReportDialog, setOpenReportDialog] = useState(false);

  const toggleDialog = (id: number) => {
    setOpenDialogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    if (!classData) {
      getClassById(Number(id));
    }
  }, [id, classData, getClassById]);

  const handleClassSettings = async (action: string) => {
    setLoading(true);

    switch (action) {
      case "delete":
        if (classData) {
          let response;
          // Vymazanie všetkých súborov zo všetkých príspevkov v triede z bucketu
          for (const post of classData.content) {
            if (post.files && post.files.length > 0) {
              for (const file of post.files) {
                if (user) {
                  response = await deleteFileFromClassContent(classData?.created_by.id.toString(), classData.id, post.id, file.name, user.id);
                } else {
                  toast.error('User not found. Cannot delete files.');
                  setLoading(false);
                  return;
                }
              }
            }
          }

          response = await deleteClass(classData.id);

          if (response.success) {
            toast.success('Class deleted successfully!');
            router.push("/classes");
          } else {
            toast.error(response.message || 'Failed to delete class.');
          }

          break;
        }
      case "edit":
        if (classData) {
          toggleDialog(classData.id);
        }
        break;
      case "report":
        setOpenReportDialog(true);

        break;
      case "remove_students":
        const teacher = classData?.members?.filter((member) => member.role === "teacher") || [];
        const payloadwithoutStudents = { ...classData, members: teacher };
        const responseWithoutStudents = await editClass(Number(classData?.id), payloadwithoutStudents);

        if (responseWithoutStudents.success) {
          toast.success('All students removed successfully!');
          getClassById(Number(classData?.id));
        } else {
          toast.error(responseWithoutStudents.message || 'Failed to remove students.');
        }

        break;
      case "remove_content":
        if (classData) {
          // Vymazanie všetkých súborov zo všetkých príspevkov v triede z bucketu
          for (const post of classData.content) {
            if (post.files && post.files.length > 0) {
              for (const file of post.files) {
                if (user) {
                  await deleteFileFromClassContent(classData.created_by.id.toString(), classData.id, post.id, file.name, user.id);
                } else {
                  toast.error('User not found. Cannot delete files.');
                  setLoading(false);
                  return;
                }
              }
            }
          }

          const payloadWithoutContent = { ...classData, content: [], };
          const responseWithoutContent = await editClass(Number(classData.id), payloadWithoutContent);

          if (responseWithoutContent.success) {
            toast.success('All content removed successfully!');
            getClassById(Number(classData.id));
          } else {
            toast.error(responseWithoutContent.message || 'Failed to remove content.');
          }
        } else {
          toast.error('Class data not found.');
        }

        break;
      default:
        toast.error("Unknown action");
    }

    setLoading(false);
  };

  const invitationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/classes/${classData?.id}`;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(invitationUrl).then(() => {
      toast.success('Class URL copied to clipboard!');
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 md:p-8">
      <div className="bg-sidebar rounded-lg justify-between p-4 md:flex">
        <div>
          <Popover open={openMobileClassSettings} onOpenChange={setMobileClassSettings}>
            <PopoverTrigger asChild>
              <EllipsisVertical className="cursor-pointer absolute right-5 md:hidden" />
            </PopoverTrigger>
            <PopoverContent className="w-[150px] p-0">
              <Command>
                <CommandList>
                  <CommandEmpty>Not found</CommandEmpty>
                  <CommandGroup>
                    {(isTeacher ? classSettings : classSettings.filter(option => option.value === 'report')).map((option) => (
                      <CommandItem
                        key={option.label}
                        value={option.value}
                        onSelect={() => {
                          handleClassSettings(option.value);
                          setMobileClassSettings(false);
                        }}
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
          <h1 className="text-2xl">{classData?.title}</h1>
          <strong>{classData?.name}</strong>
          <p>{classData?.class_time}</p>
          <div className="flex gap-2">
            <p>{invitationUrl}</p>
            {/* <Share2 size={20} className="hover:cursor-pointer hover:scale-125 duration-300" /> */}
            <Copy size={20} className="hover:cursor-pointer hover:scale-125 duration-300" onClick={handleCopyToClipboard} />
          </div>
        </div>

        <div className="flex flex-col md:text-right">
          <Popover open={openClassSettings} onOpenChange={setClassSettings}>
            <PopoverTrigger asChild>
              <EllipsisVertical className="me-0 ms-auto cursor-pointer hidden md:flex" />
            </PopoverTrigger>
            <PopoverContent className="w-[150px] p-0">
              <Command>
                <CommandList>
                  <CommandEmpty>Not found</CommandEmpty>
                  <CommandGroup>
                    {(isTeacher ? classSettings : classSettings.filter(option => option.value === 'report')).map((option) => (
                      <CommandItem
                        key={option.label}
                        value={option.value}
                        onSelect={() => {
                          handleClassSettings(option.value);
                          setClassSettings(false);
                        }}
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
          <strong>{classData?.created_by.name}</strong>
          <p>{classData?.year}</p>
          <p>{classData?.members?.length ?? 0} {(classData?.members?.length ?? 0) > 1 ? "Members" : "Member"}</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full min-h-screen bg-sidebar rounded-lg p-4">
        <TabsList className='mb-3'>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {classData?.content ? (
            <ClassDashboard />
          ) : (
            <p className="text-gray-500">No posts in class yet</p>
          )}
        </TabsContent>

        <TabsContent value="members">
          {classData?.members ? (
            <ClassMembers />
          ) : (
            <p className="text-gray-500">No members in class yet</p>
          )}
        </TabsContent>

        <TabsContent value="files">
          {classData?.content?.some(post => post.files && post.files.length > 0) ? (
            <ClassFiles />
          ) : (
            <p className="text-gray-500">No files in class yet</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Create / Update Class dialog */}
      {classData && openDialogs[classData.id] && (
        <ClassDialog
          type="edit"
          isOpen={openDialogs[classData.id]}
          onClose={() => toggleDialog(classData.id)}
          initialData={classData}
        />
      )}

      {/* Report dialog */}
      <ReportDialog
        type="class"
        content_id={classData?.id ?? ''}
        isOpen={openReportDialog}
        onClose={() => setOpenReportDialog(false)}
      />
    </div>
  )
}

export default Class