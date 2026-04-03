"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function JoinTripForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setJoining(true);

    // Support both full URLs and plain codes
    let inviteCode = trimmed;
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split("/");
      const tripIndex = parts.indexOf("trip");
      if (tripIndex !== -1 && parts[tripIndex + 1]) {
        inviteCode = parts[tripIndex + 1];
      }
    } catch {
      // Not a URL — treat as plain invite code
    }

    router.push(`/trip/${inviteCode}`);
  };

  return (
    <form onSubmit={handleJoin} className="flex w-full max-w-md flex-col gap-3">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste invite link or code"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        required
      />
      <button
        type="submit"
        disabled={joining || !code.trim()}
        className="rounded-xl border-2 border-indigo-600 bg-white px-6 py-3 text-base font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {joining ? "Joining..." : "Join Trip"}
      </button>
    </form>
  );
}
