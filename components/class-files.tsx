'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useClassStore } from '@/stores/classStore';

const ClassFiles = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const classData = useClassStore((state) => state.classes.find((c) => c.id === Number(id)));

  return (
    <div className="space-y-6 z-10">
      {/* Iterate over all posts in the class */}
      {classData?.content.map((post) => (
        post.files.length > 0 && (
          <div key={post.id} className="bg-gray-100 dark:bg-secondary p-6 rounded-lg shadow-lg space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{post.title}</h2>

            {/* Iterate over all files in the post */}
            <div className="space-y-2">
              {post.files.map((file) => (
                <div key={file.id} className="md:flex items-center md:space-x-4 p-3 rounded-lg bg-white dark:bg-sidebar hover:bg-gray-50 dark:hover:bg-black transition-colors duration-200">
                  <div className='flex items-center gap-2'>
                    <ExternalLink className="text-gray-600" size={20} />
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple hover:underline text-lg font-medium"
                    >
                      {file.name}
                    </a>
                  </div>
                  <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default ClassFiles;