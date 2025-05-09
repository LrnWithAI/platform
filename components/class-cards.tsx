import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { deleteClass, getClasses } from '@/actions/classActions';
import { useLoadingStore } from '@/stores/loadingStore';
import { useClassStore } from '@/stores/classStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from './ui/button';
import ClassDialog from './class-dialog';
import { deleteFileFromClassContent } from '@/actions/storageActions';
import { Class } from '@/types/class';

export function ClassesCards({ orderOption, filterOption }: { orderOption: string, filterOption: Record<string, string> }) {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const setClasses = useClassStore((state) => state.setClasses);
  const classes = useClassStore((state) => state.classes)
  const [openDialogs, setOpenDialogs] = useState<{ [key: number]: boolean }>({});
  const user = useUserStore((state) => state.user);

  const isTeacher = (classData: Class) => classData?.members.some((member) => member.role === 'teacher' && member.id === user?.id);

  const toggleDialog = (id: number) => {
    setOpenDialogs((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the dialog open/close for this class
    }));
  };

  // Filtering
  const filteredClasses = classes.filter((card) => {
    for (const key in filterOption) {
      const filterValue = filterOption[key]?.toString().toLowerCase();
      const cardValue = (key in card) ? (card as Record<string, any>)[key] : undefined;

      // Handle the 'members' field differently
      if (key === "members" && Array.isArray(cardValue)) {

        // Compare the length of the 'members' array
        if (filterValue && !cardValue.length.toString().includes(filterValue)) {
          return false;
        }
      } else if (cardValue && cardValue.toString().toLowerCase && !cardValue.toString().toLowerCase().includes(filterValue)) {
        return false;
      }
    }
    return true;
  });

  // Sorting
  const sortedClasses = filteredClasses.sort((a, b) => {
    if (orderOption === "newest") {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    if (orderOption === "older") {
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    }
    if (orderOption === "a-z") {
      return a.title.localeCompare(b.title);
    }
    if (orderOption === "z-a") {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);

      // Vymazanie všetkých súborov zo všetkých príspevkov v triede z bucketu
      const classData = classes.find((c) => c.id === id);

      if (!classData) return;

      for (const post of classData.content) {
        if (post.files && post.files.length > 0) {
          for (const file of post.files) {
            if (user) {
              await deleteFileFromClassContent(classData?.created_by.id.toString(), classData.id, post.id, file.name, user.id);
            } else {
              toast.error('User is not authenticated.');
            }
          }
        }
      }

      // Vymazanie samotnej triedy
      const response = await deleteClass(id);
      if (response.success) {
        toast.success('Class deleted successfully!');

        // Fetch the updated list after deleting
        const response = await getClasses(user.id);
        if (response) {
          setClasses(response.data);
          toast.success('Updated classes loaded successfully!');
        } else {
          toast.error('Failed to fetch classes.');
        }
      } else {
        toast.error(response.message || 'Failed to delete card.');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the card.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {sortedClasses.map((card) => (
        <div
          key={card.id}
          className="relative p-5 border rounded-lg shadow bg-sidebar hover:cursor-pointer hover:scale-105 duration-300"
        >
          {/* Action Buttons */}
          {isTeacher(card) && (
            <div className="absolute top-2 right-2 flex gap-1">
              <Button className="bg-violet-500 rounded-sm hover:bg-violet-600 h-7 w-7" onClick={() => toggleDialog(card.id)}>
                <Pencil size={16} />
              </Button>
              <Button className="bg-red-500 rounded-sm text-sm hover:bg-red-600 h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }}>
                <Trash2 size={16} />
              </Button>
            </div>
          )}

          <ClassDialog type="edit" isOpen={openDialogs[card.id] || false} onClose={() => toggleDialog(card.id)} initialData={card} />

          {/* Card Content */}
          <Link href={`/classes/${card.id}`}>
            <h2 className="text-lg font-bold mb-2">{card.title}</h2>
            <div className="flex">
              <Image
                src={card.image.url || "/class_cover.jpg"}
                alt={`Class ${card.id}`}
                width={60}
                height={20}
                unoptimized
              />
              <div className="ml-4 flex flex-col justify-center">
                <p className="text-sm text-gray-700 dark:text-gray-400 font-bold">{card.class_time}</p>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">{card.members.length} {card.members.length > 1 ? "Members" : "Member"}</p>
              </div>
            </div>
          </Link>
        </div >
      ))
      }
    </div >
  );
}