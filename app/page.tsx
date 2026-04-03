import CreateTripForm from "@/components/CreateTripForm";
import JoinTripForm from "@/components/JoinTripForm";
import AuthError from "@/components/AuthError";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <AuthError />
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Plan your group trip,{" "}
          <span className="text-indigo-600">together.</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          No more scattered WhatsApp messages and dead polls. Pick a
          destination, align dates, and lock in your trip — all in one place.
        </p>

        {/* Create + Join side by side on desktop, stacked on mobile */}
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {/* Create trip */}
          <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Start a new trip
            </h2>
            <CreateTripForm />
          </div>

          {/* Join trip */}
          <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Join an existing trip
            </h2>
            <JoinTripForm />
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16">
          <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500 mb-6">
            How it works
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
            {[
              {
                step: "1",
                title: "Create & Invite",
                desc: "Start a trip and share the invite link with your group via WhatsApp.",
              },
              {
                step: "2",
                title: "Suggest & Vote",
                desc: "Everyone suggests destinations. The group votes. No more endless debates.",
              },
              {
                step: "3",
                title: "Set Budget & Dates",
                desc: "Each member sets their budget range and marks available dates.",
              },
              {
                step: "4",
                title: "Lock & Go",
                desc: "Organizer locks the destination and dates. Trip confirmed!",
              },
            ].map((feature) => (
              <div
                key={feature.step}
                className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 mb-3">
                  {feature.step}
                </div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
