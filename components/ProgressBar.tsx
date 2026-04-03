"use client";

const steps = [
  { key: "planning", label: "Create Trip" },
  { key: "destination_locked", label: "Pick Destination" },
  { key: "dates", label: "Align Dates" },
  { key: "confirmed", label: "Confirmed" },
];

function getStepIndex(status: string): number {
  switch (status) {
    case "planning":
      return 0;
    case "destination_locked":
      return 1;
    case "dates_locked":
      return 2;
    case "confirmed":
      return 3;
    default:
      return 0;
  }
}

export default function ProgressBar({ status }: { status: string }) {
  const currentStep = getStepIndex(status);

  return (
    <div className="w-full">
      {/* Mobile: compact */}
      <div className="flex items-center justify-between gap-1">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;

          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              {/* Step row */}
              <div className="flex w-full items-center">
                {/* Connector left */}
                {i > 0 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      isCompleted || isCurrent ? "bg-indigo-500" : "bg-gray-200"
                    }`}
                  />
                )}

                {/* Circle */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isCompleted
                      ? "bg-indigo-600 text-white"
                      : isCurrent
                      ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>

                {/* Connector right */}
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      isCompleted ? "bg-indigo-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-1.5 text-center text-[10px] sm:text-xs font-medium leading-tight ${
                  isCompleted || isCurrent ? "text-indigo-700" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
