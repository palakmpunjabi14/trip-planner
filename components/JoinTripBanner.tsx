"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function JoinTripBanner({
  tripId,
  tripName,
  isSignedIn,
}: {
  tripId: string;
  tripName: string;
  isSignedIn: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [joining, setJoining] = useState(false);

  const handleSignIn = async () => {
    const redirectTo = `${window.location.origin}/auth/callback?next=${window.location.pathname}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        await handleSignIn();
        return;
      }

      const { error } = await supabase.from("trip_members").insert({
        trip_id: tripId,
        user_id: user.id,
        name: user.user_metadata?.full_name || "Member",
        avatar_url: user.user_metadata?.avatar_url || null,
        is_organizer: false,
      });

      if (error) throw error;

      toast.success(`Joined "${tripName}"!`);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to join trip";
      toast.error(message);
      setJoining(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 p-6 text-center">
      <h2 className="text-xl font-semibold text-gray-900">
        You&apos;re invited to &quot;{tripName}&quot;
      </h2>
      <p className="mt-2 text-gray-600">
        {isSignedIn
          ? "Join this trip to vote on destinations and mark your available dates."
          : "Sign in with Google to join this trip and start planning together."}
      </p>
      {isSignedIn ? (
        <button
          onClick={handleJoin}
          disabled={joining}
          className="mt-4 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {joining ? "Joining..." : "Join This Trip"}
        </button>
      ) : (
        <button
          onClick={handleSignIn}
          className="mt-4 flex items-center gap-2 mx-auto rounded-xl bg-white border border-gray-300 px-6 py-3 font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google to Join
        </button>
      )}
    </div>
  );
}
