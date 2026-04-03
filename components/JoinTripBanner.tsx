"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function JoinTripBanner({
  tripId,
  tripName,
}: {
  tripId: string;
  tripName: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const redirectTo = `${window.location.origin}/auth/callback?next=${window.location.pathname}`;
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo },
        });
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
      <p className="mt-2 text-gray-600">Join this trip to vote on destinations and mark your available dates.</p>
      <button
        onClick={handleJoin}
        disabled={joining}
        className="mt-4 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {joining ? "Joining..." : "Join This Trip"}
      </button>
    </div>
  );
}
