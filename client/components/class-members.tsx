'use client'

import React from 'react';
import { Trash2, Mail } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useClassStore } from '@/stores/classStore';
import { useLoadingStore } from '@/stores/loadingStore';
import { editClass, getClasses } from '@/actions/classActions';
import { toast } from 'react-toastify';

const ClassMembers = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const classData = useClassStore((state) => state.classes.find((c) => c.id === Number(id)));
  const setLoading = useLoadingStore((state) => state.setLoading);
  const setClasses = useClassStore((state) => state.setClasses);

  const teacher = classData?.members.find((member) => member.role === 'teacher');
  const students = classData?.members.filter((member) => member.role === 'student') || [];

  const handleDelete = async (id: number) => {
    classData?.members.splice(
      classData?.members.findIndex((member) => member.id === id),
      1
    );

    try {
      setLoading(true);

      if (!classData) {
        toast.error("Class data is not available.");
        return;
      }
      const response = await editClass(classData.id, {
        members: classData.members,
      });

      if (response.success) {
        toast.success("User removed successfully!");

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

  return (
    <div className="space-y-6">
      {teacher && (
        <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white p-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-1">Teacher</h2>
          <div className="flex items-center justify-between pb-3">
            <div>
              <p className="text-lg mb-1 text-white">{teacher.name}</p>
              <a
                href={`mailto:${teacher.email}`}
                className="text-sm underline hover:text-gray-200"
              >
                {teacher.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${teacher.email}`}
                className="bg-violet-500 text-white px-3 py-1.5 rounded-lg hover:bg-violet-600 flex items-center gap-1"
              >
                <Mail size={16} />
                Email
              </a>
            </div>
          </div>
        </div>
      )
      }
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Students</h2>
        {students.length > 0 ? (
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between border-b pb-3 last:border-none"
              >
                <div>
                  <p className="text-lg font-semibold">{student.name}</p>
                  <a
                    href={`mailto:${student.email}`}
                    className="text-sm text-violet-500 underline hover:text-violet-600"
                  >
                    {student.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${student.email}`}
                    className="bg-violet-500 text-white px-3 py-1.5 rounded-lg hover:bg-violet-600 flex items-center gap-1"
                  >
                    <Mail size={16} />
                    Email
                  </a>
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No students in this class.</p>
        )}
      </div>
    </div >
  );
};

export default ClassMembers;
