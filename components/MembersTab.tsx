"use client";

import ShareButton from "./ShareButton";

interface Member {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  is_organizer: boolean;
}

interface BudgetPref {
  id: string;
  member_id: string;
}

interface DateAvail {
  id: string;
  member_id: string;
}

export default function MembersTab({
  members,
  inviteCode,
  tripName,
  budgets,
  dateAvailability,
  tripStatus,
}: {
  members: Member[];
  inviteCode: string;
  tripName: string;
  budgets: BudgetPref[];
  dateAvailability: DateAvail[];
  tripStatus: string;
}) {
  const membersWithBudget = new Set(budgets.map((b) => b.member_id));
  const membersWithDates = new Set(dateAvailability.map((d) => d.member_id));

  const pendingMembers = members.filter(
    (m) => !membersWithBudget.has(m.user_id) || !membersWithDates.has(m.user_id)
  );

  const handleNudge = () => {
    const url = `${window.location.origin}/trip/${inviteCode}`;
    const pendingNames = pendingMembers
      .map((m) => m.name.split(" ")[0])
      .join(", ");

    let action = "vote on destinations, set your budget, and mark your dates";
    if (tripStatus === "destination_locked") {
      action = "set your budget and mark your available dates";
    } else if (tripStatus === "confirmed") {
      action = "check the confirmed trip details";
    }

    const message = `Hey ${pendingNames}! We're planning *${tripName}* on TripSync. Please ${action}:\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Members ({members.length})
      </h3>

      <ShareButton inviteCode={inviteCode} tripName={tripName} />

      <div className="space-y-2">
        {members.map((member) => {
          const hasBudget = membersWithBudget.has(member.user_id);
          const hasDates = membersWithDates.has(member.user_id);

          return (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex items-center gap-3">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt=""
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  {member.is_organizer && (
                    <span className="text-xs text-indigo-600 font-medium">
                      Organizer
                    </span>
                  )}
                </div>
              </div>

              {/* Status indicators */}
              <div className="flex items-center gap-1.5">
                <span
                  title={hasBudget ? "Budget set" : "Budget not set"}
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    hasBudget
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  ₹
                </span>
                <span
                  title={hasDates ? "Dates marked" : "Dates not marked"}
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    hasDates
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  📅
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nudge button */}
      {pendingMembers.length > 0 && tripStatus !== "confirmed" && (
        <button
          onClick={handleNudge}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Nudge {pendingMembers.length} member{pendingMembers.length !== 1 ? "s" : ""} via WhatsApp
        </button>
      )}
    </div>
  );
}
