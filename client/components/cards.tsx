import React from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';

import Image from 'next/image';
import { toast } from 'react-toastify';
import { CardsProps } from '@/types/class';
import { deleteClass, getClasses } from '@/actions/classActions';
import { useLoadingStore } from '@/stores/loadingStore';
import { useClassStore } from '@/stores/classStore';

export function Cards({ cardsType, navigateTo }: CardsProps) {
  const router = useRouter();
  const setLoading = useLoadingStore((state) => state.setLoading);
  const setClasses = useClassStore((state) => state.setClasses);
  const cards =
    cardsType === "class"
      ? useClassStore((state) => state.classes)
      : cardsType === "test"
        ? []
        : cardsType === "flashcard"
          ? []
          : []

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response =
        cardsType === "class" ?
          await deleteClass(id) :
          cardsType === "test" ?
            { success: true, message: "Test successfully deleted" } :
            cardsType === "flashcard" ?
              { success: true, message: "Flashcard successfully deleted" } :
              { success: false, message: "Failed to delete card" }


      if (response.success) {
        toast.success('Card deleted successfully!');

        // Fetch the updated list after deleting
        setLoading(true);
        const response =
          cardsType === "class" ?
            await getClasses() :
            cardsType === "test" ?
              { success: true, message: "Updated tests loaded", data: [] } :
              cardsType === "flashcard" ?
                { success: true, message: "Updated flashcards loaded", data: [] } :
                { success: false, message: "Failed to delete card", data: [] }

        setLoading(false);
        if (response) {
          setClasses(response.data);
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
    // Navigate to an edit page with the card's ID as a query parameter
    router.push(`/edit-card/${id}`);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="relative p-5 border rounded-lg shadow bg-white hover:cursor-pointer hover:scale-105 duration-300"
        >
          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(card.id);
              }}
              className="bg-purple-500 text-white px-2 py-1 rounded-sm text-sm hover:bg-purple-600"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(card.id);
              }}
              className="bg-red-500 text-white px-2 py-1 rounded-sm text-sm hover:bg-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Card Content */}
          <h2 className="text-lg font-bold mb-2">{card.title}</h2>
          <div className="flex">
            <Image
              src={card.image_url}
              alt={`Class ${card.id}`}
              width={60}
              height={20}
            />
            <div className="ml-4 flex flex-col justify-center">
              <p className="text-sm text-gray-700 font-bold">{card.description1}</p>
              <p className="text-sm text-gray-500 mt-2">{card.description2}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}