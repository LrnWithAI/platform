import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { deleteClass, getClasses } from '@/actions/classActions';
import { useLoadingStore } from '@/stores/loadingStore';
import { useClassStore } from '@/stores/classStore';
import { Button } from './ui/button';
import ClassDialog from './class-dialog';

export function ClassesCards({ orderOption, filterOption }: { orderOption: string, filterOption: Record<string, string> }) {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const setClasses = useClassStore((state) => state.setClasses);
  const classes = useClassStore((state) => state.classes)
  const [openDialogs, setOpenDialogs] = useState<{ [key: number]: boolean }>({});

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
      const cardValue = card[key];

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
      const response = await deleteClass(id);
      if (response.success) {
        toast.success('Card deleted successfully!');

        // Fetch the updated list after deleting
        const response = await getClasses();
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
          className="relative p-5 border rounded-lg shadow bg-white hover:cursor-pointer hover:scale-105 duration-300"
        >

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button className="bg-violet-500 rounded-sm hover:bg-violet-600 h-7 w-7" onClick={() => toggleDialog(card.id)}>
              <Pencil size={16} />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(card.id);
              }}
              className="bg-red-500 rounded-sm text-sm hover:bg-red-600 h-7 w-7"
            >
              <Trash2 size={16} />
            </Button>
          </div>

          <ClassDialog type="edit" isOpen={openDialogs[card.id] || false} onClose={() => toggleDialog(card.id)} initialData={card} />

          {/* Card Content */}
          <Link href={`/classes/${card.id}`}>
            <h2 className="text-lg font-bold mb-2">{card.title}</h2>
            <div className="flex">
              <Image
                src={card.image_url || "/class_cover.jpg"}
                alt={`Class ${card.id}`}
                width={60}
                height={20}
              />
              <div className="ml-4 flex flex-col justify-center">
                <p className="text-sm text-gray-700 font-bold">{card.class_time}</p>
                <p className="text-sm text-gray-500 mt-2">{card.members.length + " Members"}</p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}