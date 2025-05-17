'use client'

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMemberToClassSchema } from '@/schema/addMemberToClass';
import { useForm } from 'react-hook-form';

import { Trash2, Mail, CirclePlus, SquareArrowOutUpRight } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';

import { useClassStore } from '@/stores/classStore';
import { useLoadingStore } from '@/stores/loadingStore';
import { editClass, getClasses } from '@/actions/classActions';
import { inviteToClass } from '@/actions/authActions';
import { toast } from 'react-toastify';
import { useUserStore } from '@/stores/userStore';

type FormData = z.infer<typeof addMemberToClassSchema>;

const ClassMembers = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const classData = useClassStore((state) => state.classes.find((c) => c.id === Number(id)));

  const setLoading = useLoadingStore((state) => state.setLoading);
  const setClasses = useClassStore((state) => state.setClasses);

  const user = useUserStore((state) => state.user);

  const teachers = classData?.members.filter((member) => member.role === 'teacher');
  const students = classData?.members.filter((member) => member.role === 'student') || [];
  const isTeacher = classData?.members.some((member) => member.role === 'teacher' && member.id === user?.id);

  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(addMemberToClassSchema),
  });

  const onSubmit = async (data: FormData) => {
    await handleInviteStudent(data.email);
    reset();
  };

  const handleDelete = async (id: string) => {
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
        if (user && user.id) {
          const updatedClasses = await getClasses(user.id);
          if (updatedClasses) {
            setClasses(updatedClasses.data);
            toast.success('Updated classes loaded successfully!');
          }
        }
      } else {
        toast.error(response.message || "Failed to update class.");
      }
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error("An error occurred while updating the class.");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteStudent = async (email: string) => {
    if (classData?.id === undefined) {
      toast.error("Class ID is not available.");
      return;
    }
    const response = await inviteToClass(email, classData.id);

    if (response?.success) {
      toast.success(response.message);
      // Fetch the updated list after editing
      if (user && user.id) {
        const updatedClasses = await getClasses(user.id);
        if (updatedClasses) {
          setClasses(updatedClasses.data);
          toast.success('Updated classes loaded successfully!');
          setOpen(false);
        } else {
          toast.error(response.message || "Failed to update class.");
        }
      } else {
        toast.error("User information is not available.");
      }
    } else {
      toast.error(response?.message || "Failed to invite member.");
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      <Dialog open={open} onOpenChange={setOpen}>
        {isTeacher && (
          <DialogTrigger className='absolute right-0 top-[-75px]'>
            <Button className="bg-purple hover:bg-violet-500 text-white" onClick={() => setOpen(true)}>
              <CirclePlus size={20} /> Add Student
            </Button>
          </DialogTrigger>
        )}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="text-center">
                <strong className="font-bold text-2xl">Add student to your class</strong>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogDescription className="border rounded-xl text-left p-3 flex flex-col gap-5 mb-4">
              <div>
                <Label htmlFor="email">Student&apos;s e-mail address</Label>
                <Input
                  id="email"
                  placeholder="example@email.com"
                  className="border"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </DialogDescription>

            <DialogFooter className="flex gap-2 w-full">
              <DialogClose asChild className="w-full">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit" variant="default" className="w-full">
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="bg-gradient-to-r from-indigo-500 via-purple to-pink-500 text-white p-4 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-1">{(teachers?.length ?? 0) > 1 ? "Teachers" : "Teacher"} </h2>
        {teachers?.map((teacher) => (
          <>
            <div className="flex items-center justify-between pb-3">
              <div>
                <div className='flex items-center gap-2 cursor-pointer hover:text-gray-200' onClick={() => { router.push(`/profile/${teacher?.username}`) }}>
                  <p className="text-lg mb-1">{teacher.name}</p>
                  <SquareArrowOutUpRight size={16} />
                </div>
                <p className="text-sm text-gray-200">{teacher.email} </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${teacher.email}`}
                  className="bg-purple text-white px-3 py-1.5 rounded-lg hover:bg-violet-500 flex items-center gap-1"
                >
                  <Mail size={16} />
                  Email
                </a>
              </div>
            </div>
          </>
        ))
        }
      </div>

      <div className="bg-gray-100 dark:bg-secondary p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Students</h2>
        {students.length > 0 ? (
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between border-b pb-3 last:border-none"
              >
                <div>
                  <div onClick={() => { router.push(`/profile/${student.username}`) }} className='flex items-center gap-2 cursor-pointer hover:text-gray-500'>
                    <p className="text-lg font-semibold">{student.name} </p>
                    <SquareArrowOutUpRight size={16} />
                  </div>
                  <p className="text-sm text-purple">
                    {student.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${student.email}`}
                    className="bg-purple text-white px-3 py-1.5 rounded-lg hover:bg-violet-500 flex items-center gap-1"
                  >
                    <Mail size={16} />
                    Email
                  </a>
                  {
                    isTeacher && (
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )
                  }
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
