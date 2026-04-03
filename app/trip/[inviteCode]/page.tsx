import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TripPageClient from "./TripPageClient";

export default async function TripPage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = await params;
  const supabase = await createClient();

  // Fetch trip by invite code (public — no auth needed)
  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("invite_code", inviteCode)
    .single();

  if (!trip) {
    redirect("/");
  }

  // Get current user (may be null if not signed in)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch members (public read)
  const { data: members } = await supabase
    .from("trip_members")
    .select("*")
    .eq("trip_id", trip.id)
    .order("joined_at", { ascending: true });

  // Check if current user is a member
  const isMember = user
    ? members?.some((m) => m.user_id === user.id) ?? false
    : false;

  const isOrganizer = user ? trip.created_by === user.id : false;

  // Fetch destinations with vote counts
  const { data: destinations } = await supabase
    .from("destinations")
    .select("*, destination_votes(*)")
    .eq("trip_id", trip.id)
    .order("created_at", { ascending: true });

  // Fetch date availability
  const { data: dateAvailability } = await supabase
    .from("date_availability")
    .select("*")
    .eq("trip_id", trip.id);

  return (
    <TripPageClient
      trip={trip}
      members={members || []}
      destinations={destinations || []}
      dateAvailability={dateAvailability || []}
      isMember={isMember}
      isOrganizer={isOrganizer}
      currentUserId={user?.id || null}
      inviteCode={inviteCode}
      isSignedIn={!!user}
    />
  );
}
