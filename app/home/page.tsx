"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { useLoadingStore } from "@/stores/loadingStore";
import { Cards } from "@/components/universal_cards";

import { getMostSubmittedTest } from "@/actions/testActions";
import { getClassWithMostMembers } from "@/actions/classActions";

export default function Home() {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const user = useUserStore((state) => state.user);

  const [tests, setTests] = useState<any[]>([]);
  const [popularClass, setPopularClass] = useState<any[] | null>([]);

  const fetchTests = async () => {
    setLoading(true);
    const result = await getMostSubmittedTest();

    if (result.success && result.data) {
      setTests([result.data]);
    }

    setLoading(false);
  };

  const fetchPopularClass = async () => {
    setLoading(true);

    const res = await getClassWithMostMembers();

    if (res.success && res.data) {
      setPopularClass([res.data]);
    }

    console.log("popular class, ", popularClass);
    setLoading(false);
  };

  useEffect(() => {
    fetchTests();
    fetchPopularClass();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 p-8">
      <div className="flex flex-row justify-between">
        <div>
          <h1 className="text-2xl font-bold">Home</h1>
        </div>
        {user ? (
          <div className="flex flex-col items-start border rounded-md p-2">
            <p className="text-md text-gray-800">
              Welcome, <span className="font-semibold"> {user?.username} </span>
            </p>
            <p className="text-md text-gray-800">
              It's{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        ) : (
          <p className="text-lg text-gray-600">No user logged in.</p>
        )}
      </div>

      {/* Popular studied tests */}
      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <p>Popular studied test</p>
        </div>
      </div>
      {tests.length > 0 && (
        <Cards data={tests} type="tests" refreshData={fetchTests} />
      )}

      {/* Class with most members */}
      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <p>Class with most members</p>
        </div>
      </div>
      {popularClass && (
        <Cards
          type="classes"
          data={popularClass}
          refreshData={fetchPopularClass}
        />
      )}

      {/* Top creators */}
      <div className="flex justify-between">
        <div className="flex gap-1 items-center">
          <p>Top creators</p>
        </div>
      </div>
      <p>Dajake pekne cards na creatorov lebo idk co tu dat</p>
    </div>
  );
}
