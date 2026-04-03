"use client";

import { useState } from "react";

const tabs = ["Members", "Destinations", "Dates", "Summary"] as const;
type Tab = (typeof tabs)[number];

export default function TripTabs({
  children,
}: {
  children: (activeTab: Tab) => React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Members");

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4">{children(activeTab)}</div>
    </div>
  );
}
