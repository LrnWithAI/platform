'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { BriefcaseBusiness, Download, Globe, Mail, Phone } from 'lucide-react'

import { User } from '@/types/user'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserByUsername } from '@/actions/userActions'

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

const Profile = () => {
  const { username } = useParams()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getUserByUsername(username as string);
        if (data) {
          setUser(data)
          //toast.success("User fetched successfully")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Failed to fetch user data")
      }
    }

    fetchUser()
  }, [username])

  const handleDownloadFile = async (url: string, fileName: string) => {
    const response = await fetch(url);
    const blob = await response.blob();

    const a = document.createElement('a');
    const urlBlob = window.URL.createObjectURL(blob);

    a.href = urlBlob;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(urlBlob);
  }

  return (
    <div className="space-y-8 p-3 md:p-6 shadow-md rounded-lg bg-sidebar md:w-3/4 md:mx-auto m-3 md:m-0 md:mt-10">
      <div className="flex items-center gap-6">
        <Avatar className="w-24 h-24">
          <AvatarImage
            src={user?.avatar_url || "https://github.com/shadcn.png"}
            alt={user?.full_name || "User Avatar"}
          />
          <AvatarFallback className="text-4xl font-bold">
            {user?.full_name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            {user?.full_name || "Unknown User"}
          </h1>
          {user?.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : "Role not specified"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-100 dark:bg-secondary rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Contact Information</h2>

          <div className="flex justify-between items-center gap-2">
            <p className="flex items-center gap-2">
              Email: {user?.email || "Not provided"}
            </p>
            {user?.email && (
              <a href={`mailto:${user.email}`}>
                <Mail size={16} className="text-purple hover:text-violet-500" />
              </a>
            )}
          </div>

          <div className="flex justify-between items-center gap-2 mt-2">
            <p className="flex items-center gap-2">
              Phone: {user?.phone || "Not provided"}
            </p>
            {user?.phone && (
              <a href={`tel:${user.phone}`}>
                <Phone size={16} className="text-purple hover:text-violet-500" />
              </a>
            )}
          </div>

          <div className="flex justify-between items-center gap-2 mt-2">
            <p className="flex items-center gap-2">
              Website: {user?.website || "Not provided"}
            </p>
            {user?.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer">
                <Globe size={16} className="text-purple hover:text-violet-500" />
              </a>
            )}
          </div>

          <div className="flex justify-between items-center gap-2 mt-2">
            <p className="flex items-center gap-2">
              Workplace: {user?.workplace || "Not provided"}
            </p>
            {user?.workplace && (
              <BriefcaseBusiness size={16} className="text-purple " />
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-secondary rounded-lg max-h-60 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">About Me</h2>
          <p className="whitespace-pre-line">
            {user?.bio || "No information available"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="whatido" className="w-full">
        <TabsList className="flex gap-4 border-b">
          <TabsTrigger value="whatido" className="p-2 py-2 md:px-4 rounded-md ">
            What I Do
          </TabsTrigger>
          <TabsTrigger value="announcements" className="p-2 py-2 md:px-4 rounded-md">
            Announcements
          </TabsTrigger>
          <TabsTrigger value="files" className="py-2 md:px-4 rounded-md">
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whatido" className="p-4 bg-gray-50 dark:bg-secondary rounded-md">
          <p className="whitespace-pre-line">
            {user?.whatIDo || "No information available"}
          </p>
        </TabsContent>

        <TabsContent value="announcements" className="p-4 bg-gray-50 dark:bg-secondary rounded-md">
          <p className="whitespace-pre-line">
            {user?.announcements || "No information available"}
          </p>
        </TabsContent>

        <TabsContent value="files" className="p-4 bg-gray-50 dark:bg-secondary rounded-md">
          {user?.files && user.files.length > 0 ? (
            <ul className="space-y-2">
              {user.files.map((file: UploadedFile) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between border bg-sidebar p-2 rounded-md"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleDownloadFile(file.url, file.name)}
                  >
                    <Download className="h-4 w-4 text-purple hover:text-violet-500" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No files uploaded.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile
