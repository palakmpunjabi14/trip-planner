"use client";

import { useState } from "react";

const tabs = [
  { key: "Members", icon: "👥", label: "Members" },
  { key: "Destinations", icon: "📍", label: "Places" },
  { key: "Budget", icon: "💰", label: "Budget" },
  { key: "Dates", icon: "📅", label: "Dates" },
  { key: "Summary", icon: "✅", label: "Summary" },
] as const;

type Tab = (typeof tabs)[number]["key"];

export default function TripTabs({
  children,
}: {
  children: (activeTab: Tab) => React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Members");

  return (
    <div>
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-0 py-2.5 text-center text-xs sm:text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="sm:hidden">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden block text-[10px] leading-tight mt-0.5">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
      <div className="p-4">{children(activeTab)}</div>
    </div>
  );
}
