"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";

interface BudgetPref {
  id: string;
  trip_id: string;
  member_id: string;
  min_budget: number;
  max_budget: number;
}

interface Member {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
}

export default function BudgetTab({
  tripId,
  budgets,
  members,
  currentUserId,
}: {
  tripId: string;
  budgets: BudgetPref[];
  members: Member[];
  currentUserId: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const myBudget = budgets.find((b) => b.member_id === currentUserId);
  const [minBudget, setMinBudget] = useState(
    myBudget?.min_budget?.toString() || ""
  );
  const [maxBudget, setMaxBudget] = useState(
    myBudget?.max_budget?.toString() || ""
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const min = parseInt(minBudget);
    const max = parseInt(maxBudget);

    if (isNaN(min) || isNaN(max)) {
      toast.error("Enter valid numbers");
      return;
    }
    if (min > max) {
      toast.error("Min budget can't exceed max budget");
      return;
    }
    if (min < 0) {
      toast.error("Budget can't be negative");
      return;
    }

    setSaving(true);
    try {
      if (myBudget) {
        const { error } = await supabase
          .from("budget_preferences")
          .update({ min_budget: min, max_budget: max })
          .eq("id", myBudget.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("budget_preferences")
          .insert({
            trip_id: tripId,
            member_id: currentUserId,
            min_budget: min,
            max_budget: max,
          });
        if (error) throw error;
      }
      toast.success("Budget saved!");
      router.refresh();
    } catch {
      toast.error("Failed to save budget");
    }
    setSaving(false);
  };

  // Calculate group overlap
  const overlap = useMemo(() => {
    if (budgets.length < 2) return null;
    const groupMin = Math.max(...budgets.map((b) => b.min_budget));
    const groupMax = Math.min(...budgets.map((b) => b.max_budget));
    if (groupMin > groupMax) return { hasOverlap: false, min: groupMin, max: groupMax };
    return { hasOverlap: true, min: groupMin, max: groupMax };
  }, [budgets]);

  // For the visual bar
  const allMin = budgets.length > 0 ? Math.min(...budgets.map((b) => b.min_budget)) : 0;
  const allMax = budgets.length > 0 ? Math.max(...budgets.map((b) => b.max_budget)) : 100000;
  const range = allMax - allMin || 1;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      {/* My budget form */}
      <form onSubmit={handleSave} className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Your Budget Range (per person)
        </h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Min Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                ₹
              </span>
              <input
                type="number"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                placeholder="5,000"
                min={0}
                className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Max Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                ₹
              </span>
              <input
                type="number"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="15,000"
                min={0}
                className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : myBudget ? "Update Budget" : "Set Budget"}
        </button>
      </form>

      {/* Group budget overview */}
      {budgets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Group Budget Overview
          </h3>

          {/* Overlap indicator */}
          {overlap && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                overlap.hasOverlap
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {overlap.hasOverlap ? (
                <>
                  <span className="font-semibold">Sweet spot: </span>
                  {formatCurrency(overlap.min)} — {formatCurrency(overlap.max)} per person
                </>
              ) : (
                <>
                  <span className="font-semibold">No overlap! </span>
                  Budgets don&apos;t align — the group needs to discuss and adjust.
                </>
              )}
            </div>
          )}

          {/* Visual bars per member */}
          <div className="space-y-3">
            {members.map((m) => {
              const budget = budgets.find((b) => b.member_id === m.user_id);
              if (!budget) {
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 truncate text-sm text-gray-500">
                      {m.name.split(" ")[0]}
                    </span>
                    <span className="text-xs text-gray-400 italic">
                      Not set yet
                    </span>
                  </div>
                );
              }

              const leftPct = ((budget.min_budget - allMin) / range) * 100;
              const widthPct =
                ((budget.max_budget - budget.min_budget) / range) * 100;

              return (
                <div key={m.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {m.name.split(" ")[0]}
                      {m.user_id === currentUserId && (
                        <span className="text-indigo-500 ml-1 text-xs">(you)</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatCurrency(budget.min_budget)} —{" "}
                      {formatCurrency(budget.max_budget)}
                    </span>
                  </div>
                  <div className="relative h-3 w-full rounded-full bg-gray-100">
                    <div
                      className="absolute h-full rounded-full bg-indigo-400"
                      style={{
                        left: `${leftPct}%`,
                        width: `${Math.max(widthPct, 2)}%`,
                      }}
                    />
                    {/* Overlap zone */}
                    {overlap?.hasOverlap && (
                      <div
                        className="absolute h-full rounded-full bg-green-400 opacity-30"
                        style={{
                          left: `${((overlap.min - allMin) / range) * 100}%`,
                          width: `${Math.max(((overlap.max - overlap.min) / range) * 100, 1)}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Who hasn't set budget */}
          {members.filter((m) => !budgets.find((b) => b.member_id === m.user_id)).length > 0 && (
            <p className="text-xs text-gray-400">
              Waiting on:{" "}
              {members
                .filter((m) => !budgets.find((b) => b.member_id === m.user_id))
                .map((m) => m.name.split(" ")[0])
                .join(", ")}
            </p>
          )}
        </div>
      )}

      {budgets.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-4">
          No one has set their budget yet. Be the first!
        </p>
      )}
    </div>
  );
}
