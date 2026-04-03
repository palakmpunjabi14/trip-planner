"use client";

import { format } from "date-fns";

interface Trip {
  id: string;
  name: string;
  invite_code: string;
  locked_destination_id: string | null;
  locked_start_date: string | null;
  locked_end_date: string | null;
  status: string;
}

interface Member {
  id: string;
  user_id: string;
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

interface BudgetPref {
  id: string;
  member_id: string;
  min_budget: number;
  max_budget: number;
}

interface DateAvail {
  id: string;
  member_id: string;
}

export default function SummaryTab({
  trip,
  members,
  destinations,
  budgets,
  dateAvailability,
}: {
  trip: Trip;
  members: Member[];
  destinations: Destination[];
  budgets: BudgetPref[];
  dateAvailability: DateAvail[];
}) {
  const lockedDest = destinations.find(
    (d) => d.id === trip.locked_destination_id
  );
  const isConfirmed = trip.status === "confirmed";

  // Pending actions
  const membersWithBudget = new Set(budgets.map((b) => b.member_id));
  const membersWithDates = new Set(dateAvailability.map((d) => d.member_id));

  const noBudgetMembers = members.filter(
    (m) => !membersWithBudget.has(m.user_id)
  );
  const noDateMembers = members.filter(
    (m) => !membersWithDates.has(m.user_id)
  );

  // Budget sweet spot
  const budgetOverlap =
    budgets.length >= 2
      ? (() => {
          const groupMin = Math.max(...budgets.map((b) => b.min_budget));
          const groupMax = Math.min(...budgets.map((b) => b.max_budget));
          return groupMin <= groupMax
            ? { min: groupMin, max: groupMax }
            : null;
        })()
      : null;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  if (trip.status === "planning" && destinations.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-4xl mb-3">🗺️</div>
        <h3 className="text-lg font-semibold text-gray-900">
          Trip is just getting started
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Head to the <strong>Destinations</strong> tab to suggest places, and{" "}
          <strong>Budget</strong> tab to set your range.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isConfirmed && (
        <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-bold text-green-800">Trip Confirmed!</h3>
          <p className="text-sm text-green-600 mt-1">
            Everything is locked in. Time to pack!
          </p>
        </div>
      )}

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
        {!lockedDest && destinations.length > 0 && (
          <p className="mt-1 text-xs text-gray-400">
            {destinations.length} destination{destinations.length !== 1 ? "s" : ""} suggested — waiting for organizer to lock
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Dates
        </h4>
        {trip.locked_start_date && trip.locked_end_date ? (
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {format(new Date(trip.locked_start_date + "T00:00:00"), "MMM d")} —{" "}
            {format(new Date(trip.locked_end_date + "T00:00:00"), "MMM d, yyyy")}
          </p>
        ) : (
          <>
            <p className="mt-1 text-gray-500">Not yet decided</p>
            {dateAvailability.length > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                {membersWithDates.size}/{members.length} members marked availability
              </p>
            )}
          </>
        )}
      </div>

      {/* Budget */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Budget (per person)
        </h4>
        {budgetOverlap ? (
          <p className="mt-1 text-lg font-semibold text-green-700">
            {formatCurrency(budgetOverlap.min)} — {formatCurrency(budgetOverlap.max)}
          </p>
        ) : budgets.length >= 2 ? (
          <p className="mt-1 text-sm text-red-600 font-medium">
            No overlap — budgets need discussion
          </p>
        ) : (
          <p className="mt-1 text-gray-500">
            {budgets.length === 0
              ? "No one has set their budget"
              : `${budgets.length}/${members.length} members set budget`}
          </p>
        )}
      </div>

      {/* Travelers */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Travelers ({members.length})
        </h4>
        <div className="mt-2 flex flex-wrap gap-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              {m.avatar_url ? (
                <img src={m.avatar_url} alt="" className="h-7 w-7 rounded-full" />
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

      {/* Pending Actions */}
      {!isConfirmed && (noBudgetMembers.length > 0 || noDateMembers.length > 0) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Still pending
          </h4>
          {noBudgetMembers.length > 0 && (
            <p className="text-sm text-amber-800">
              <span className="font-medium">Budget not set:</span>{" "}
              {noBudgetMembers.map((m) => m.name.split(" ")[0]).join(", ")}
            </p>
          )}
          {noDateMembers.length > 0 && (
            <p className="text-sm text-amber-800">
              <span className="font-medium">Dates not marked:</span>{" "}
              {noDateMembers.map((m) => m.name.split(" ")[0]).join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
