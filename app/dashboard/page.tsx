import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: memberships } = await supabase
    .from("trip_members")
    .select("trip_id, is_organizer, trips(*)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  interface TripData {
    id: string;
    name: string;
    invite_code: string;
    status: string;
    created_at: string;
  }

  const trips = memberships?.map((m) => {
    const t = m.trips as unknown as TripData;
    return { ...t, is_organizer: m.is_organizer };
  }) || [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
        <Link
          href="/"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          + New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No trips yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <Link
              key={trip.id as string}
              href={`/trip/${trip.invite_code}`}
              className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {trip.name as string}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        trip.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : trip.status === "destination_locked"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {trip.status === "confirmed"
                        ? "Confirmed"
                        : trip.status === "destination_locked"
                        ? "Dest. Locked"
                        : "Planning"}
                    </span>
                    {trip.is_organizer && (
                      <span className="text-xs text-indigo-600">Organizer</span>
                    )}
                    <span>
                      Created{" "}
                      {format(
                        new Date(trip.created_at as string),
                        "MMM d, yyyy"
                      )}
                    </span>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
