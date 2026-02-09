"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "@/lib/device";

export default function RequestLoanPage() {
  const router = useRouter();

  const [amount, setAmount] = useState(50000);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      const deviceId = getDeviceId();

      const res = await fetch("/api/check-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const data = await res.json();

      if (!data.active || !data.customer) {
        router.push("/");
        return;
      }

      setCustomerId(data.customer.id);
    }

    loadSession();
  }, [router]);

  // 15% interest
  const interest = Math.round(amount * 0.15);
  const totalRepayment = amount + interest;

  async function handleSubmit() {
    if (!customerId) return;

    await fetch("/api/create-loan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        amount,
        totalRepayment,
      }),
    });

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-10 text-white">
      <h1 className="text-2xl font-semibold mb-6">
        Request a Loan
      </h1>

      <div className="max-w-md space-y-6">
        {/* Loan info */}
        <div className="border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">
            Standard Loan
          </p>
          <p className="text-lg font-semibold">
            30 days • 15% interest
          </p>
        </div>

        {/* Amount selector */}
        <div>
          <p className="text-gray-400 mb-2">
            Select amount
          </p>
          <p className="text-3xl font-semibold mb-4">
            ₹{amount.toLocaleString()}
          </p>

          <input
            type="range"
            min="5000"
            max="1000000"
            step="5000"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Repayment */}
        <div className="border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">
            Interest (15%)
          </p>
          <p className="text-lg">
            ₹{interest.toLocaleString()}
          </p>

          <p className="text-gray-400 text-sm mt-3">
            Total after 30 days
          </p>
          <p className="text-xl font-semibold">
            ₹{totalRepayment.toLocaleString()}
          </p>
        </div>

        {/* Terms */}
        <div className="text-xs text-gray-500">
          If the loan is not settled within 30 days, it may
          enter an extension period with revised interest
          as per company terms.
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition"
        >
          Submit Loan Request
        </button>
      </div>
    </main>
  );
}
