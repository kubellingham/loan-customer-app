"use client";

import { useRouter } from "next/navigation";

export default function RequestLoanPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-10 text-white">
      <h1 className="text-2xl font-semibold mb-6">
        Choose a Loan Plan
      </h1>

      <div className="space-y-4 max-w-md">

        {/* Starter */}
        <div className="border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold">Starter Plan</h2>
          <p className="text-gray-400">30 days • 15% total</p>

          <button
            onClick={() => router.push("/request-loan/amount?plan=starter")}
            className="mt-4 w-full py-2 rounded-lg bg-yellow-500 text-black"
          >
            Select
          </button>
        </div>

        {/* Growth */}
        <div className="border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold">Growth Plan</h2>
          <p className="text-gray-400">60 days • 18% per month</p>

          <button
            onClick={() => router.push("/request-loan/amount?plan=growth")}
            className="mt-4 w-full py-2 rounded-lg bg-yellow-500 text-black"
          >
            Select
          </button>
        </div>

        {/* Pro */}
        <div className="border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold">Pro Plan</h2>
          <p className="text-gray-400">90 days • 21% per month</p>

          <button
            onClick={() => router.push("/request-loan/amount?plan=pro")}
            className="mt-4 w-full py-2 rounded-lg bg-yellow-500 text-black"
          >
            Select
          </button>
        </div>

      </div>
    </main>
  );
}
