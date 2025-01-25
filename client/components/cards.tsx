import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CardsProps } from '@/types/class';

export function Cards({ cards, navigateTo }: CardsProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="p-5 border rounded-lg shadow bg-white hover:cursor-pointer hover:scale-105 duration-300"
          onClick={() => router.push(navigateTo)}
        >
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
};