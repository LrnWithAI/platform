import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'react-toastify';
import { deleteClass, editClass, getClasses } from '@/actions/classActions';
import { useLoadingStore } from '@/stores/loadingStore';
import { useClassStore } from '@/stores/classStore';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function ClassesCards({ orderOption, filterOption }: { orderOption: string, filterOption: Record<string, string> }) {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const setClasses = useClassStore((state) => state.setClasses);
  const classes = useClassStore((state) => state.classes)
  const [editData, setEditData] = useState({
    title: "",
    name: "",
    class_time: "",
    year: "",
    image_url: "",
  });

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

  const handleEdit = async (id: number) => {
    try {
      setLoading(true);
      const response = await editClass(id, {
        title: editData.title,
        name: editData.name,
        class_time: editData.class_time,
        year: editData.year,
        image_url: editData.image_url,
      });
      if (response.success) {
        toast.success("Class updated successfully!");

        // Fetch the updated list after editing
        const updatedClasses = await getClasses();
        if (updatedClasses) {
          setClasses(updatedClasses.data);
          toast.success('Updated classes loaded successfully!');
        }
      } else {
        toast.error(response.message || "Failed to update class.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the class.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
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
            <Dialog>
              <DialogTrigger>
                <Button
                  className="bg-violet-500 rounded-sm hover:bg-violet-600 h-7 w-7"
                  onClick={() => setEditData({ id: card.id, title: card.title, name: card.name, class_time: card.class_time, year: card.year, image_url: card.image_url })}
                >
                  <Pencil size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    <div className="text-center">
                      <strong className="font-bold text-2xl">Edit {card.title} </strong>
                      <p className="font-thin my-3">Details of your class</p>
                    </div>
                  </DialogTitle>
                  <DialogDescription className="border rounded-xl text-left p-3 flex flex-col gap-5">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        className="border"
                        value={editData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        className="border"
                        value={editData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="class_time">Class Time</Label>
                      <Input
                        id="class_time"
                        className="border"
                        value={editData.class_time}
                        onChange={(e) => handleInputChange("class_time", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        className="border"
                        value={editData.year}
                        onChange={(e) => handleInputChange("year", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="image_url">Image</Label>
                      <Input
                        id="image_url"
                        className="border"
                        type="file"
                        onChange={(e) => handleInputChange("image_url", e.target.value)}
                      />
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
                    <Button type="button" variant="default" onClick={() => handleEdit(card.id)}>
                      Save
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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

          <Link href={`/classes/${card.id}`}>
            {/* Card Content */}
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