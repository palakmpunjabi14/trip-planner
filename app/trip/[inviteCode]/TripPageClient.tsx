"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import JoinTripBanner from "@/components/JoinTripBanner";
import TripTabs from "@/components/TripTabs";
import MembersTab from "@/components/MembersTab";
import DestinationsTab from "@/components/DestinationsTab";
import DatesTab from "@/components/DatesTab";
import SummaryTab from "@/components/SummaryTab";

interface Trip {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
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

interface DateAvail {
  id: string;
  trip_id: string;
  member_id: string;
  available_date: string;
}

export default function TripPageClient({
  trip: initialTrip,
  members: initialMembers,
  destinations: initialDestinations,
  dateAvailability: initialDateAvailability,
  isMember,
  isOrganizer,
  currentUserId,
  inviteCode,
  isSignedIn,
}: {
  trip: Trip;
  members: Member[];
  destinations: Destination[];
  dateAvailability: DateAvail[];
  isMember: boolean;
  isOrganizer: boolean;
  currentUserId: string | null;
  inviteCode: string;
  isSignedIn: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [trip, setTrip] = useState(initialTrip);
  const [members, setMembers] = useState(initialMembers);
  const [destinations, setDestinations] = useState(initialDestinations);
  const [dateAvailability, setDateAvailability] = useState(initialDateAvailability);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`trip-${trip.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_members", filter: `trip_id=eq.${trip.id}` },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "destinations", filter: `trip_id=eq.${trip.id}` },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "destination_votes" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "date_availability", filter: `trip_id=eq.${trip.id}` },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trips", filter: `id=eq.${trip.id}` },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trip.id, supabase, router]);

  // Update state when props change (from router.refresh())
  useEffect(() => { setTrip(initialTrip); }, [initialTrip]);
  useEffect(() => { setMembers(initialMembers); }, [initialMembers]);
  useEffect(() => { setDestinations(initialDestinations); }, [initialDestinations]);
  useEffect(() => { setDateAvailability(initialDateAvailability); }, [initialDateAvailability]);

  if (!isMember) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <JoinTripBanner tripId={trip.id} tripName={trip.name} isSignedIn={isSignedIn} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
        <div className="mt-1 flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            trip.status === "confirmed"
              ? "bg-green-100 text-green-800"
              : trip.status === "destination_locked"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            {trip.status === "confirmed"
              ? "Confirmed"
              : trip.status === "destination_locked"
              ? "Destination Locked"
              : "Planning"}
          </span>
          <span className="text-sm text-gray-500">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <TripTabs>
          {(activeTab) => {
            switch (activeTab) {
              case "Members":
                return <MembersTab members={members} inviteCode={inviteCode} tripName={trip.name} />;
              case "Destinations":
                return (
                  <DestinationsTab
                    tripId={trip.id}
                    destinations={destinations}
                    lockedDestinationId={trip.locked_destination_id}
                    isOrganizer={isOrganizer}
                    currentUserId={currentUserId!}
                  />
                );
              case "Dates":
                return (
                  <DatesTab
                    tripId={trip.id}
                    dateAvailability={dateAvailability}
                    members={members}
                    lockedStartDate={trip.locked_start_date}
                    lockedEndDate={trip.locked_end_date}
                    isOrganizer={isOrganizer}
                    currentUserId={currentUserId!}
                    tripStatus={trip.status}
                  />
                );
              case "Summary":
                return (
                  <SummaryTab
                    trip={trip}
                    members={members}
                    destinations={destinations}
                  />
                );
            }
          }}
        </TripTabs>
      </div>
    </div>
  );
}
