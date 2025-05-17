"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import { updateUserProfile } from "@/actions/userActions";
import { toast } from "react-toastify";

export default function Avatar({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string | null;
  url: string | null;
  size: number;
  onUpload: (url: string) => void;
}) {
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
  const [uploading, setUploading] = useState(false);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Keďže bucket je verejný, môžeme priamo použiť URL z databázy.
  useEffect(() => {
    if (url) {
      setAvatarUrl(url);
    }
  }, [url]);

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      if (!uid) {
        throw new Error("UID is null");
      }
      const filePath = `${uid}-${Math.random()}.${fileExt}`;

      // Upload súboru do bucketu "avatars"
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Získanie verejnej URL pomocou getPublicUrl
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Public URL is undefined");
      }

      // Spusti callback, ak je potrebné (napr. pre lokálne uloženie filePath)
      onUpload(publicUrlData.publicUrl);

      if (!user?.id) {
        throw new Error("User ID is missing");
      }

      const responseUpdate = await updateUserProfile(user.id, {
        avatar_url: publicUrlData.publicUrl,
      });
      if (responseUpdate.success) {
        setAvatarUrl(publicUrlData.publicUrl);
        if (user?.id) {
          setUser({ ...user, avatar_url: publicUrlData.publicUrl });
        } else {
          console.error("User ID is undefined");
        }
      } else {
        console.error("Profile update failed", responseUpdate);
        throw new Error("Profile update failed");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Error uploading avatar!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex gap-5 items-center">
      {avatarUrl ? (
        <Image
          width={size}
          height={size}
          src={avatarUrl}
          alt="Avatar"
          unoptimized
          className="rounded-full aspect-square object-cover border"
        />
      ) : (
        <div
          className="avatar no-image"
          style={{ height: size, width: size }}
        />
      )}
      <div className="flex flex-col md:flex-row gap-4">
        <Button onClick={handleUploadButtonClick} variant="outline">
          {avatarUrl ? "Change avatar" : "Upload"}
        </Button>
        {avatarUrl && (
          <Button className="bg-red-500 hover:bg-red-600">Delete avatar</Button>
        )}
        <input
          ref={fileInputRef}
          style={{ visibility: "hidden", position: "absolute" }}
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
