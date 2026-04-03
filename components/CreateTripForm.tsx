"use client";

import { createClient } from "@/lib/supabase/client";
import { generateInviteCode } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CreateTripForm() {
  const supabase = createClient();
  const router = useRouter();
  const [tripName, setTripName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName.trim()) return;

    setCreating(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in first to create a trip.");
        setCreating(false);
        return;
      }

      const inviteCode = generateInviteCode();

      // Use RPC or insert without select to avoid RLS SELECT issue
      // Insert trip first
      const { error: tripError } = await supabase
        .from("trips")
        .insert({
          name: tripName.trim(),
          invite_code: inviteCode,
          created_by: user.id,
        });

      if (tripError) throw tripError;

      // Fetch the trip we just created (creator can read by invite_code via RLS)
      // We need the trip ID, so query by invite_code
      const { data: trip, error: fetchError } = await supabase
        .from("trips")
        .select("id")
        .eq("invite_code", inviteCode)
        .single();

      if (fetchError || !trip) {
        // If RLS blocks even this, add member using invite_code approach
        // For now, just redirect and let the join flow handle it
        router.push(`/trip/${inviteCode}`);
        return;
      }

      const { error: memberError } = await supabase
        .from("trip_members")
        .insert({
          trip_id: trip.id,
          user_id: user.id,
          name: user.user_metadata?.full_name || "Organizer",
          avatar_url: user.user_metadata?.avatar_url || null,
          is_organizer: true,
        });

      if (memberError) throw memberError;

      router.push(`/trip/${inviteCode}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create trip";
      toast.error(message);
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="flex w-full max-w-md flex-col gap-3">
      <input
        type="text"
        value={tripName}
        onChange={(e) => setTripName(e.target.value)}
        placeholder="e.g. Goa with College Gang"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        maxLength={60}
        required
      />
      <button
        type="submit"
        disabled={creating || !tripName.trim()}
        className="rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {creating ? "Creating..." : "Create Trip"}
      </button>
    </form>
  );
}
