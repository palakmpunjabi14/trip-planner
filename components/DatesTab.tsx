"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  startOfDay,
  startOfMonth,
  endOfMonth,
  format,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isBefore,
} from "date-fns";
import toast from "react-hot-toast";

interface DateAvail {
  id: string;
  trip_id: string;
  member_id: string;
  available_date: string;
}

interface Member {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
}

export default function DatesTab({
  tripId,
  dateAvailability,
  members,
  lockedStartDate,
  lockedEndDate,
  isOrganizer,
  currentUserId,
  tripStatus,
}: {
  tripId: string;
  dateAvailability: DateAvail[];
  members: Member[];
  lockedStartDate: string | null;
  lockedEndDate: string | null;
  isOrganizer: boolean;
  currentUserId: string;
  tripStatus: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [selecting, setSelecting] = useState(false);
  const [lockStart, setLockStart] = useState("");
  const [lockEnd, setLockEnd] = useState("");

  const isLocked = !!lockedStartDate && !!lockedEndDate;

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 59);

  // Build months to display
  const months: Date[] = [];
  let m = startOfMonth(today);
  while (isBefore(m, maxDate) || isSameDay(m, startOfMonth(maxDate))) {
    months.push(m);
    m = addMonths(m, 1);
  }

  // My selected dates
  const myDates = dateAvailability.filter(
    (d) => d.member_id === currentUserId
  );
  const myDateSet = new Set(myDates.map((d) => d.available_date));

  // Heatmap: count how many members are available per date
  const heatmap = useMemo(() => {
    const map: Record<string, number> = {};
    dateAvailability.forEach((d) => {
      map[d.available_date] = (map[d.available_date] || 0) + 1;
    });
    return map;
  }, [dateAvailability]);

  const totalMembers = members.length;

  const toggleDate = async (date: Date) => {
    if (isLocked || isBefore(date, today)) return;

    setSelecting(true);
    const dateStr = format(date, "yyyy-MM-dd");

    try {
      if (myDateSet.has(dateStr)) {
        const toRemove = myDates.find((d) => d.available_date === dateStr);
        if (toRemove) {
          await supabase
            ?.from("date_availability")
            .delete()
            .eq("id", toRemove.id);
        }
      } else {
        await supabase.from("date_availability").insert({
          trip_id: tripId,
          member_id: currentUserId,
          available_date: dateStr,
        });
      }
      router.refresh();
    } catch {
      toast.error("Failed to update date");
    }
    setSelecting(false);
  };

  const handleLockDates = async () => {
    if (!lockStart || !lockEnd) {
      toast.error("Select both start and end dates");
      return;
    }
    if (lockEnd < lockStart) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      const { error } = await supabase
        .from("trips")
        .update({
          locked_start_date: lockStart,
          locked_end_date: lockEnd,
          status: "confirmed",
        })
        .eq("id", tripId);

      if (error) throw error;
      toast.success("Trip dates locked! Trip is confirmed!");
      router.refresh();
    } catch {
      toast.error("Failed to lock dates");
    }
  };

  const getHeatColor = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const count = heatmap[dateStr] || 0;
    if (count === 0) return "";
    const ratio = count / totalMembers;
    if (ratio === 1) return "bg-green-500 text-white";
    if (ratio >= 0.75) return "bg-green-400 text-white";
    if (ratio >= 0.5) return "bg-green-300 text-green-900";
    if (ratio >= 0.25) return "bg-green-200 text-green-900";
    return "bg-green-100 text-green-800";
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6">
      {isLocked && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          Trip dates locked:{" "}
          <strong>
            {format(new Date(lockedStartDate + "T00:00:00"), "MMM d, yyyy")}
          </strong>{" "}
          to{" "}
          <strong>
            {format(new Date(lockedEndDate + "T00:00:00"), "MMM d, yyyy")}
          </strong>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <span className="font-medium">Availability:</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-4 w-4 rounded bg-green-100" /> Few
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-4 w-4 rounded bg-green-300" /> Half
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-4 w-4 rounded bg-green-500" /> All
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-4 w-4 rounded border-2 border-indigo-500" />{" "}
          Your pick
        </span>
      </div>

      {/* Month-by-month calendars */}
      {months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: calStart, end: calEnd });

        return (
          <div key={format(month, "yyyy-MM")} className="space-y-2">
            <h3 className="text-base font-bold text-gray-800">
              {format(month, "MMMM yyyy")}
            </h3>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekDays.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-medium text-gray-500 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const isCurrentMonth = isSameMonth(day, month);
                const isPast =
                  isBefore(day, today) && !isSameDay(day, today);
                const isOutOfRange = !isBefore(day, addDays(maxDate, 1));
                const disabled =
                  !isCurrentMonth || isPast || isLocked || selecting || isOutOfRange;
                const isSelected = myDateSet.has(dateStr);
                const heat = isCurrentMonth ? getHeatColor(day) : "";
                const count = heatmap[dateStr] || 0;
                const isToday = isSameDay(day, today);

                if (!isCurrentMonth) {
                  return (
                    <div
                      key={dateStr}
                      className="aspect-square rounded-md"
                    />
                  );
                }

                return (
                  <button
                    key={dateStr}
                    onClick={() => toggleDate(day)}
                    disabled={disabled}
                    title={
                      isPast
                        ? format(day, "EEE, MMM d")
                        : count > 0
                        ? `${format(day, "EEE, MMM d")} — ${count}/${totalMembers} available`
                        : `${format(day, "EEE, MMM d")} — No one yet`
                    }
                    className={`relative aspect-square rounded-md text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5
                      ${isPast || isOutOfRange ? "text-gray-300 cursor-not-allowed" : "cursor-pointer hover:ring-2 hover:ring-indigo-300"}
                      ${heat}
                      ${isSelected ? "ring-2 ring-indigo-500 ring-offset-1" : ""}
                      ${!heat && !isPast && !isOutOfRange ? "bg-gray-50 text-gray-700" : ""}
                      ${isToday ? "font-bold underline" : ""}
                    `}
                  >
                    <span>{format(day, "d")}</span>
                    {count > 0 && !isPast && (
                      <span className="text-[10px] leading-none opacity-75">
                        {count}/{totalMembers}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Member availability summary */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">
          Who marked dates
        </h4>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const count = dateAvailability.filter(
              (d) => d.member_id === m.user_id
            ).length;
            return (
              <span
                key={m.id}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  count > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {m.name.split(" ")[0]}: {count} days
              </span>
            );
          })}
        </div>
      </div>

      {/* Organizer lock dates */}
      {isOrganizer && !isLocked && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-indigo-800">
            Lock Trip Dates (Organizer Only)
          </h4>
          <p className="text-xs text-indigo-600">
            Pick the best date range based on member availability above.
          </p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-indigo-600 font-medium">
                Start Date
              </label>
              <input
                type="date"
                value={lockStart}
                onChange={(e) => setLockStart(e.target.value)}
                min={format(today, "yyyy-MM-dd")}
                className="w-full rounded border border-indigo-200 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-indigo-600 font-medium">
                End Date
              </label>
              <input
                type="date"
                value={lockEnd}
                onChange={(e) => setLockEnd(e.target.value)}
                min={lockStart || format(today, "yyyy-MM-dd")}
                className="w-full rounded border border-indigo-200 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleLockDates}
            disabled={!lockStart || !lockEnd}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Lock Dates & Confirm Trip
          </button>
        </div>
      )}
    </div>
  );
}
