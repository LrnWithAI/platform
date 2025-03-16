'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { BriefcaseBusiness, Globe, Mail, Phone } from 'lucide-react';

import { User } from '@/types/user';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserProfile } from '@/actions/userActions';
import { downloadImage } from '@/actions/storageActions';

const Profile = () => {
  const { id } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getUserProfile(id);
        if (data) {
          setUser(data);
          toast.success("User fetched successfully");
        }
      } catch (error) {
        toast.error("Failed to fetch user data");
      }
    }

    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (user?.avatar_url) {
        const res = await downloadImage(user.avatar_url);
        if (res.success) {
          setUserAvatarUrl(res.data);
          toast.success("Avatar fetched successfully");
        } else {
          toast.error("Failed to fetch avatar");
        }
      }
    };

    if (user) {
      fetchAvatar();
    }
  }, [user]);

  return (
    <div className="space-y-8 p-6 shadow-md rounded-lg bg-gray-50 w-3/4 mx-auto mt-10">
      <div className="flex items-center gap-6">
        <Avatar className="w-24 h-24">
          <AvatarImage
            src={userAvatarUrl || "https://github.com/shadcn.png"}
            alt={user?.full_name || "User Avatar"}
          />
          <AvatarFallback className="text-4xl font-bold">{user?.full_name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user?.full_name || "Unknown User"}</h1>
          {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Role not specified"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Contact Information</h2>

          <div className='flex justify-between items-center gap-2'>
            <p className="flex items-center gap-2">
              Email: {user?.email || "Not provided"}
            </p>
            {user?.email && (
              <a href={`mailto:${user.email}`}>
                <Mail size={16} className="text-gray-500 hover:text-purple" />
              </a>
            )}
          </div>

          <div className='flex justify-between items-center gap-2 mt-2'>
            <p className="flex items-center gap-2">
              Phone: {user?.phone || "Not provided"}
            </p>
            {user?.phone && (
              <a href={`tel:${user.phone}`}>
                <Phone size={16} className="text-gray-500 hover:text-purple" />
              </a>
            )}
          </div>

          <div className='flex justify-between items-center gap-2 mt-2'>
            <p className="flex items-center gap-2">
              Website: {user?.website || "Not provided"}
            </p>
            {user?.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer">
                <Globe size={16} className="text-gray-500 hover:text-purple" />
              </a>
            )}
          </div>

          <div className='flex justify-between items-center gap-2 mt-2'>
            <p className="flex items-center gap-2">
              Workplace: {user?.workplace || "Not provided"}
            </p>
            {user?.workplace && (
              <BriefcaseBusiness size={16} className="text-gray-500" />
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg max-h-60 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">About Me</h2>
          <p className="whitespace-pre-line">
            {user?.bio || "No information available"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="whatido" className="w-full">
        <TabsList className="flex gap-4 border-b">
          <TabsTrigger value="whatido" className="px-4 py-2 rounded-md">What I Do</TabsTrigger>
          <TabsTrigger value="announcements" className="px-4 py-2 rounded-md">Announcements</TabsTrigger>
          <TabsTrigger value="files" className="px-4 py-2 rounded-md">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="whatido" className="p-4 bg-gray-50 rounded-md">
          <p className="whitespace-pre-line">{user?.bio || "No information available"}</p>
        </TabsContent>

        <TabsContent value="announcements" className="p-4 bg-gray-50 rounded-md">
          <p>No announcements yet.</p>
        </TabsContent>

        <TabsContent value="files" className="p-4 bg-gray-50 rounded-md">
          <p>No files uploaded.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile