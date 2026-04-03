"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (error !== "auth") return null;

  return (
    <div className="mb-6 w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
      Sign in failed. Please try again.
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={null}>
      <AuthErrorInner />
    </Suspense>
  );
}
