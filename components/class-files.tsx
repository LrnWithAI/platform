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
          <div key={post.id} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">{post.title}</h2>

            {/* Iterate over all files in the post */}
            <div className="space-y-2">
              {post.files.map((file) => (
                <div key={file.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <ExternalLink className="text-gray-600" size={20} />
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple hover:underline text-lg font-medium"
                  >
                    {file.name}
                  </a>
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