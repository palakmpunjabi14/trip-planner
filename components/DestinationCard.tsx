"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DestinationVote {
  id: string;
  member_id: string;
  vote: number;
}

interface Destination {
  id: string;
  name: string;
  description: string | null;
  suggested_by: string;
  destination_votes: DestinationVote[];
}

export default function DestinationCard({
  destination,
  currentUserId,
  isOrganizer,
  isLocked,
  lockedDestinationId,
  onLock,
}: {
  destination: Destination;
  currentUserId: string;
  isOrganizer: boolean;
  isLocked: boolean;
  lockedDestinationId: string | null;
  onLock: (destId: string) => void;
}) {
  const supabase = createClient();
  const router = useRouter();

  const votes = destination.destination_votes || [];
  const score = votes.reduce((sum, v) => sum + v.vote, 0);
  const userVote = votes.find((v) => v.member_id === currentUserId);
  const isThisLocked = lockedDestinationId === destination.id;

  const handleVote = async (voteValue: number) => {
    if (isLocked) return;

    try {
      if (userVote) {
        if (userVote.vote === voteValue) {
          // Remove vote
          await supabase
            .from("destination_votes")
            .delete()
            .eq("id", userVote.id);
        } else {
          // Change vote
          await supabase
            .from("destination_votes")
            .update({ vote: voteValue })
            .eq("id", userVote.id);
        }
      } else {
        // New vote
        await supabase.from("destination_votes").insert({
          destination_id: destination.id,
          member_id: currentUserId,
          vote: voteValue,
        });
      }
      router.refresh();
    } catch {
      toast.error("Failed to vote");
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isThisLocked
          ? "border-green-300 bg-green-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">
            {destination.name}
            {isThisLocked && (
              <span className="ml-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                Locked
              </span>
            )}
          </h4>
          {destination.description && (
            <p className="mt-1 text-sm text-gray-500">
              {destination.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleVote(1)}
            disabled={isLocked}
            className={`rounded-md p-1.5 transition-colors ${
              userVote?.vote === 1
                ? "bg-green-100 text-green-700"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          <span
            className={`min-w-[2rem] text-center text-sm font-bold ${
              score > 0
                ? "text-green-600"
                : score < 0
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {score}
          </span>

          <button
            onClick={() => handleVote(-1)}
            disabled={isLocked}
            className={`rounded-md p-1.5 transition-colors ${
              userVote?.vote === -1
                ? "bg-red-100 text-red-700"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {isOrganizer && !isLocked && (
        <button
          onClick={() => onLock(destination.id)}
          className="mt-3 w-full rounded-lg border border-indigo-200 bg-indigo-50 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
        >
          Lock this destination
        </button>
      )}
    </div>
  );
}
