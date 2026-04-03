import CreateTripForm from "@/components/CreateTripForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Plan your group trip,{" "}
          <span className="text-indigo-600">together.</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          No more scattered WhatsApp messages and dead polls. Pick a
          destination, align dates, and lock in your trip — all in one place.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Start a new trip
          </h2>
          <CreateTripForm />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              title: "Suggest & Vote",
              desc: "Everyone suggests destinations. The group votes. No more endless debates.",
            },
            {
              title: "Align Dates",
              desc: "See when everyone is free at a glance. Find the perfect window.",
            },
            {
              title: "Lock & Go",
              desc: "Organizer locks the destination and dates. Trip confirmed.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm"
            >
              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
