"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDeviceId } from "@/lib/device";

type Plan = {
  name: string;
  duration: number;
  monthlyInterest: number;
};

const plans: Record<string, Plan> = {
  starter: { name: "Starter", duration: 30, monthlyInterest: 15 },
  growth: { name: "Growth", duration: 60, monthlyInterest: 18 },
  pro: { name: "Pro", duration: 90, monthlyInterest: 21 },
};

export default function AmountClient() {
  const params = useSearchParams();
  const router = useRouter();
  const planKey = params.get("plan") as string;

  const plan = plans[planKey];

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

  if (!plan) {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Invalid plan
      </main>
    );
  }

  const months = plan.duration / 30;
  const totalInterest = plan.monthlyInterest * months;
  const totalRepayment = Math.round(
    amount + (amount * totalInterest) / 100
  );

  async function handleSubmit() {
    if (!customerId) return;

    await fetch("/api/create-loan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        plan,
        amount,
        totalRepayment,
      }),
    });

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-10 text-white">
      <h1 className="text-2xl font-semibold mb-6">
        {plan.name} Plan
      </h1>

      <div className="max-w-md space-y-6">
        <div>
          <p className="text-gray-400 mb-2">Select amount</p>
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

        <div className="border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-sm">You will repay</p>
          <p className="text-xl font-semibold">
            ₹{totalRepayment.toLocaleString()}
          </p>
          <p className="text-gray-500 text-sm">
            after {plan.duration} days
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg bg-yellow-500 text-black font-medium"
        >
          Submit Loan Request
        </button>
      </div>
    </main>
  );
}
