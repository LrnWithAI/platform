"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, SquareArrowOutUpRight } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { useLoadingStore } from "@/stores/loadingStore";
import { Cards } from "@/components/universal_cards";

import { getTopSubmittedTests } from "@/actions/testActions";
import { getClassWithMostMembers } from "@/actions/classActions";
import { getLatestPublicNotes, getTopNoteCreators } from "@/actions/notesActions";
import { Test } from "@/types/test";
import { Note } from "@/types/note";
import { Class } from "@/types/class";
import { User } from "@/types/user";

export default function Home() {
  const router = useRouter();
  const setLoading = useLoadingStore((state) => state.setLoading);
  const user = useUserStore((state) => state.user);

  const [tests, setTests] = useState<Test[]>([]);
  const [publicNotes, setPublicNotes] = useState<Note[]>([]);
  const [popularClass, setPopularClass] = useState<Class[] | null>([]);
  const [topCreators, setTopCreators] = useState<{ user: User; count: number }[]>([]);

  const fetchPopularTests = useCallback(async () => {
    setLoading(true);
    const res = await getTopSubmittedTests(4);
    setTests(res.data);
    setLoading(false);
  }, [setLoading]);

  const fetchPopularClass = useCallback(async () => {
    setLoading(true);
    const res = await getClassWithMostMembers();

    if (res.success && res.data) {
      setPopularClass([res.data]);
    }

    setLoading(false);
  }, [setLoading]);

  const fetchPublicNotes = useCallback(async () => {
    setLoading(true);
    const res = await getLatestPublicNotes();
    if (res.success) {
      setPublicNotes(res.data);
    }
    setLoading(false);
  }, [setLoading]);

  const fetchTopCreators = useCallback(async () => {
    setLoading(true);
    const res = await getTopNoteCreators();
    if (res.success) setTopCreators(res.data);
    setLoading(false);
  }, [setLoading]);

  useEffect(() => {
    fetchPopularTests();
    fetchPopularClass();
    fetchPublicNotes();
    fetchTopCreators();
  }, [fetchPopularTests, fetchPopularClass, fetchPublicNotes, fetchTopCreators]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">

      {/* Welcome header */}
      {user && (
        <div className="bg-card border p-4 rounded-xl shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, <span className="text-purple-600 cursor-pointer hover:text-purple-500 hover:underline" onClick={() => router.push(`/profile/${user.username}`)}>{user.username}</span></h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      )}

      {/* Most studied test */}
      <div className="bg-sidebar border rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Most Studied Test</h2>
        {tests.length > 0 ? (
          <Cards data={tests} type="tests" refreshData={fetchPopularTests} />
        ) : (
          <p className="text-muted-foreground">No data available.</p>
        )}
      </div>

      {/* Top note creators */}
      <div className="bg-sidebar border rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Top Note Creators</h2>
        {topCreators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {topCreators.map(({ user, count }) =>
              user ? (
                <div key={user.id} className="border rounded-lg p-4 shadow-sm bg-background hover:bg-muted transition">
                  <div
                    onClick={() => router.push(`/profile/${user.username}`)}
                    className="flex items-center gap-2 cursor-pointer hover:text-purple-500"
                  >
                    {/* @ts-expect-error different user is comming from fetchTopCreators */}
                    <p className="font-bold text-lg">{user.name}</p>
                    <SquareArrowOutUpRight size={16} />
                  </div>
                  <a
                    href={`mailto:${user.email}`}
                    className="flex items-center text-purple gap-2 mt-1 text-sm hover:underline"
                  >
                    <Mail size={16} />
                    {user.email}
                  </a>
                  <p className="text-purple font-semibold mt-2">{count} notes</p>
                </div>
              ) : null
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">No top creators yet.</p>
        )}
      </div>

      {/* Latest public notes */}
      <div className="bg-sidebar border rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Latest Public Notes</h2>
        {publicNotes.length > 0 ? (
          <Cards data={publicNotes} type="notes" refreshData={fetchPublicNotes} />
        ) : (
          <p className="text-muted-foreground">No public notes available.</p>
        )}
      </div>

      {/* Class with most members */}
      <div className="bg-sidebar border rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Class with Most Members</h2>
        {popularClass ? (
          <Cards data={popularClass} type="classes" refreshData={fetchPopularClass} />
        ) : (
          <p className="text-muted-foreground">No class data available.</p>
        )}
      </div>

    </div>
  );
}