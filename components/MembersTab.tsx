"use client";

import ShareButton from "./ShareButton";

interface Member {
  id: string;
  name: string;
  avatar_url: string | null;
  is_organizer: boolean;
}

export default function MembersTab({
  members,
  inviteCode,
  tripName,
}: {
  members: Member[];
  inviteCode: string;
  tripName: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Members ({members.length})
        </h3>
        <ShareButton inviteCode={inviteCode} tripName={tripName} />
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
          >
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
        ))}
      </div>
    </div>
  );
}
