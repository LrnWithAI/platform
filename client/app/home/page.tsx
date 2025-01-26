"use client";

import { useUserStore } from "@/stores/userStore";

export default function Home() {
  const user = useUserStore((state) => state.user);

  console.log("user", user);

  return (
    <div className="flex flex-col items-center justify-center bg-gray-200">
      {user ? (
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.username}
        </h1>
      ) : (
        <p className="text-lg text-gray-600">No user logged in.</p>
      )}
    </div>
  );
}
