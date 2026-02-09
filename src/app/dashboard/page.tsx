"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "@/lib/device";

type Customer = {
  id: string;
  full_name: string;
  state: string;
};

type Loan = {
  amount: number;
  total_repayment: number;
  monthly_interest: number;
  duration_days: number;
  status: string;
  approved_at: string | null;
  due_date: string | null;
  final_deadline: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const deviceId = getDeviceId();

      const sessionRes = await fetch("/api/check-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const sessionData = await sessionRes.json();

      if (!sessionData.active || !sessionData.customer) {
        router.push("/");
        return;
      }

      const customerData = sessionData.customer;
      setCustomer(customerData);

      const loanRes = await fetch("/api/get-active-loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customerData.id }),
      });

      const loanData = await loanRes.json();

      if (loanData.success && loanData.loan) {
        setLoan(loanData.loan);
      }

      setLoading(false);
    }

    loadData();
  }, [router]);

  async function handleLogout() {
    const deviceId = getDeviceId();

    await fetch("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });

    router.push("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-10 text-white">
      <div className="flex justify-end mb-6">
        <button
          onClick={handleLogout}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Logout
        </button>
      </div>

      <h1 className="text-3xl font-semibold mb-2">
        Hello {customer?.full_name} 👋
      </h1>

      <p className="text-gray-400 mb-8">
        Account status:{" "}
        <span className="text-green-400 capitalize">
          {customer?.state}
        </span>
      </p>

      {!loan && (
        <div className="rounded-xl border border-gray-800 p-6 bg-[#020617]">
          <p className="text-gray-400 mb-4">
            You have no active loan.
          </p>

          <button
            onClick={() => router.push("/request-loan")}
            className="px-5 py-3 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition"
          >
            Request Loan
          </button>
        </div>
      )}

      {loan && (
        <div className="rounded-xl border border-gray-800 p-6 bg-[#020617] max-w-md">
          <p className="text-gray-400 text-sm mb-2">
            Active Loan
          </p>

          <p className="text-2xl font-semibold mb-4">
            ₹{loan.amount.toLocaleString()}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">
                Monthly interest
              </span>
              <span>{loan.monthly_interest}%</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">
                Duration
              </span>
              <span>{loan.duration_days} days</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">
                Total repayment
              </span>
              <span className="font-semibold">
                ₹{loan.total_repayment.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">
                Status
              </span>
              <span className="capitalize">
                {loan.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {loan.approved_at && (
  <div className="space-y-2 text-sm mt-4 border-t border-gray-800 pt-4">
    <div className="flex justify-between">
      <span className="text-gray-400">Loan started</span>
      <span>
        {new Date(loan.approved_at).toLocaleDateString()}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-400">Interest due</span>
      <span>
        {new Date(loan.due_date!).toLocaleDateString()}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-gray-400">Final deadline</span>
      <span>
        {new Date(loan.final_deadline!).toLocaleDateString()}
      </span>
    </div>
  </div>
)}

    </main>
  );
}
