"use client";

import { format } from "date-fns";

interface Trip {
  id: string;
  name: string;
  locked_destination_id: string | null;
  locked_start_date: string | null;
  locked_end_date: string | null;
  status: string;
}

interface Member {
  id: string;
  name: string;
  avatar_url: string | null;
  is_organizer: boolean;
}

interface Destination {
  id: string;
  name: string;
  description: string | null;
  destination_votes: { vote: number }[];
}

export default function SummaryTab({
  trip,
  members,
  destinations,
}: {
  trip: Trip;
  members: Member[];
  destinations: Destination[];
}) {
  const lockedDest = destinations.find(
    (d) => d.id === trip.locked_destination_id
  );

  const isConfirmed = trip.status === "confirmed";

  if (trip.status === "planning") {
    return (
      <div className="py-12 text-center">
        <div className="text-4xl mb-3">🗺️</div>
        <h3 className="text-lg font-semibold text-gray-900">
          Trip is still being planned
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Vote on destinations and mark your available dates to move things
          forward.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isConfirmed && (
        <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-bold text-green-800">
            Trip Confirmed!
          </h3>
          <p className="text-sm text-green-600 mt-1">
            Everything is locked in. Time to pack!
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Destination */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Destination
          </h4>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {lockedDest ? lockedDest.name : "Not yet decided"}
          </p>
          {lockedDest?.description && (
            <p className="text-sm text-gray-500">{lockedDest.description}</p>
          )}
        </div>

        {/* Dates */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Dates
          </h4>
          {trip.locked_start_date && trip.locked_end_date ? (
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {format(new Date(trip.locked_start_date + "T00:00:00"), "MMM d")} -{" "}
              {format(new Date(trip.locked_end_date + "T00:00:00"), "MMM d, yyyy")}
            </p>
          ) : (
            <p className="mt-1 text-gray-500">Not yet decided</p>
          )}
        </div>

        {/* Members */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Travelers ({members.length})
          </h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                {m.avatar_url ? (
                  <img
                    src={m.avatar_url}
                    alt=""
                    className="h-7 w-7 rounded-full"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                    {m.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm text-gray-700">
                  {m.name.split(" ")[0]}
                  {m.is_organizer && (
                    <span className="text-indigo-500 ml-1 text-xs">(org)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
