'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation';
import { CircleAlert, Copy, EllipsisVertical, FilePenLine, Share2, SquareMinus, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { useClassStore } from '@/stores/classStore';
import { useLoadingStore } from '@/stores/loadingStore';
import { deleteClass } from '@/actions/classActions';
import { toast } from 'react-toastify';
import ClassMembers from '@/components/class-members';
import ClassDialog from '@/components/class-dialog';

const classSettings = [
  { label: "Delete", value: "delete", icon: Trash2 },
  { label: "Edit", value: "edit", icon: FilePenLine },
  { label: "Report", value: "report", icon: CircleAlert },
  { label: "Remove all members", value: "remove_members", icon: SquareMinus },
  { label: "Remove all content", value: "remove_content", icon: SquareMinus },
]

const Class = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const classData = useClassStore((state) => state.classes.find((c) => c.id === Number(id)));
  const getClassById = useClassStore((state) => state.getClassById);
  const [openClassSettings, setClassSettings] = useState(false)
  const setLoading = useLoadingStore((state) => state.setLoading);

  const [openDialogs, setOpenDialogs] = useState<{ [key: number]: boolean }>({});

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
          const response = await deleteClass(classData.id);

          if (response.success) {
            toast.success('Class deleted successfully!');
            router.push("/classes");
          } else {
            toast.error(response.message || 'Failed to delete card.');
          }
          break;
        }
      case "edit":
        if (classData) {
          toggleDialog(classData.id);
        }
        break;
      case "report":
        // Logic to report class
        console.log("Report class", classData?.id);
        break;
      case "remove_members":
        // Logic to remove all members
        console.log("Remove all members from class", classData?.id);
        break;
      case "remove_content":
        // Logic to remove all content
        console.log("Remove all content from class", classData?.id);
        break;
      default:
        console.log("Unknown action");
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
    <div className="flex flex-1 flex-col gap-4 p-8">
      <div className="bg-stone-200 rounded-lg flex justify-between p-4">
        <div>
          <h1 className="text-2xl">{classData?.title}</h1>
          <strong>{classData?.name}</strong>
          <p>{classData?.class_time}</p>
          <div className="flex gap-2">
            <p>{invitationUrl}</p>
            {/* <Share2 size={20} className="hover:cursor-pointer hover:scale-125 duration-300" /> */}
            <Copy size={20} className="hover:cursor-pointer hover:scale-125 duration-300" onClick={handleCopyToClipboard} />
          </div>
        </div>

        <div className="flex flex-col text-right">
          <Popover open={openClassSettings} onOpenChange={setClassSettings}>
            <PopoverTrigger asChild>
              <EllipsisVertical className="me-0 ms-auto cursor-pointer duration-300" />
            </PopoverTrigger>
            <PopoverContent className="w-[150px] p-0">
              <Command>
                <CommandList>
                  <CommandEmpty>Not found</CommandEmpty>
                  <CommandGroup>
                    {classSettings.map((option) => (
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

      <Tabs defaultValue="account" className="w-full h-screen bg-stone-200 rounded-lg p-4">
        <TabsList className='mb-3'>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        {/* <TabsContent value="dashboard"><ClassDashboard /></TabsContent>*/}
        <TabsContent value="members">
          {classData?.members ? (
            <ClassMembers />
          ) : (
            <p>Loading members...</p>
          )}
        </TabsContent>
        {/* <TabsContent value="files"><ClassFiles /> </TabsContent>*/}
      </Tabs>

      {classData && openDialogs[classData.id] && (
        <ClassDialog
          type="edit"
          isOpen={openDialogs[classData.id]}
          onClose={() => toggleDialog(classData.id)}
          initialData={classData}
        />
      )}
    </div>
  )
}

export default Class