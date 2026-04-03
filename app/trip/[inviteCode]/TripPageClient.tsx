"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import JoinTripBanner from "@/components/JoinTripBanner";
import TripTabs from "@/components/TripTabs";
import MembersTab from "@/components/MembersTab";
import DestinationsTab from "@/components/DestinationsTab";
import BudgetTab from "@/components/BudgetTab";
import DatesTab from "@/components/DatesTab";
import SummaryTab from "@/components/SummaryTab";
import ProgressBar from "@/components/ProgressBar";

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

interface BudgetPref {
  id: string;
  trip_id: string;
  member_id: string;
  min_budget: number;
  max_budget: number;
}

export default function TripPageClient({
  trip: initialTrip,
  members: initialMembers,
  destinations: initialDestinations,
  dateAvailability: initialDateAvailability,
  budgets: initialBudgets,
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
  budgets: BudgetPref[];
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
  const [budgets, setBudgets] = useState(initialBudgets);

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
        { event: "*", schema: "public", table: "budget_preferences", filter: `trip_id=eq.${trip.id}` },
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
  useEffect(() => { setBudgets(initialBudgets); }, [initialBudgets]);

  if (!isMember) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <JoinTripBanner tripId={trip.id} tripName={trip.name} isSignedIn={isSignedIn} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {members.length} member{members.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <ProgressBar status={trip.status} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <TripTabs>
          {(activeTab) => {
            switch (activeTab) {
              case "Members":
                return (
                  <MembersTab
                    members={members}
                    inviteCode={inviteCode}
                    tripName={trip.name}
                    budgets={budgets}
                    dateAvailability={dateAvailability}
                    tripStatus={trip.status}
                  />
                );
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
              case "Budget":
                return (
                  <BudgetTab
                    tripId={trip.id}
                    budgets={budgets}
                    members={members}
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
                    budgets={budgets}
                    dateAvailability={dateAvailability}
                  />
                );
            }
          }}
        </TripTabs>
      </div>
    </div>
  );
}
