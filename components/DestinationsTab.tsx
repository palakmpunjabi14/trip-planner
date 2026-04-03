"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import DestinationCard from "./DestinationCard";

interface DestinationVote {
  id: string;
  member_id: string;
  vote: number;
}

interface Destination {
  id: string;
  trip_id: string;
  suggested_by: string;
  name: string;
  description: string | null;
  image_url: string | null;
  destination_votes: DestinationVote[];
}

export default function DestinationsTab({
  tripId,
  destinations,
  lockedDestinationId,
  isOrganizer,
  currentUserId,
}: {
  tripId: string;
  destinations: Destination[];
  lockedDestinationId: string | null;
  isOrganizer: boolean;
  currentUserId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);

  const isLocked = !!lockedDestinationId;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    try {
      const { error } = await supabase.from("destinations").insert({
        trip_id: tripId,
        suggested_by: currentUserId,
        name: name.trim(),
        description: description.trim() || null,
      });

      if (error) throw error;

      setName("");
      setDescription("");
      router.refresh();
    } catch {
      toast.error("Failed to add destination");
    }
    setAdding(false);
  };

  const handleLock = async (destinationId: string) => {
    try {
      const { error } = await supabase
        .from("trips")
        .update({
          locked_destination_id: destinationId,
          status: "destination_locked",
        })
        .eq("id", tripId);

      if (error) throw error;
      toast.success("Destination locked!");
      router.refresh();
    } catch {
      toast.error("Failed to lock destination");
    }
  };

  // Sort by score (descending)
  const sorted = [...destinations].sort((a, b) => {
    const scoreA = a.destination_votes.reduce((s, v) => s + v.vote, 0);
    const scoreB = b.destination_votes.reduce((s, v) => s + v.vote, 0);
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-4">
      {isLocked && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          Destination has been locked by the organizer. Move to the Dates tab to align schedules.
        </div>
      )}

      {!isLocked && (
        <form onSubmit={handleAdd} className="space-y-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Suggest a destination (e.g. Goa, Manali)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            maxLength={60}
            required
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why this place? (optional)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={adding || !name.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {adding ? "Adding..." : "Suggest Destination"}
          </button>
        </form>
      )}

      {sorted.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-8">
          No destinations suggested yet. Be the first!
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((dest) => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              currentUserId={currentUserId}
              isOrganizer={isOrganizer}
              isLocked={isLocked}
              lockedDestinationId={lockedDestinationId}
              onLock={handleLock}
            />
          ))}
        </div>
      )}
    </div>
  );
}
