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

  function getDaysRemaining() {
    if (!loan?.due_date) return null;

    const now = new Date();
    const due = new Date(loan.due_date);

    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days;
  }

  const daysRemaining = getDaysRemaining();

  function getCountdownColor() {
    if (daysRemaining === null) return "text-gray-400";

    if (daysRemaining <= 3) return "text-red-400";
    if (daysRemaining <= 7) return "text-yellow-400";
    return "text-green-400";
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

      <div className="rounded-xl border border-gray-800 p-6 bg-[#020617]">
  {!loan ? (
    <p className="text-gray-400 mb-4">
      You have no active loan.
    </p>
  ) : (
    <p className="text-yellow-400 mb-4">
      You already have a pending or active loan.
    </p>
  )}

  <button
    onClick={() => {
      if (loan) {
        const confirm = window.confirm(
          "You already have a pending or active loan. Do you wish to proceed?"
        );
        if (!confirm) return;
      }
      router.push("/request-loan");
    }}
    className="px-5 py-3 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition"
  >
    Request Loan
  </button>
</div>

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
                Total repayment
              </span>
              <span className="font-semibold">
                ₹{loan.total_repayment.toLocaleString()}
              </span>
            </div>

            {loan.approved_at && (
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Loan started
                </span>
                <span>
                  {new Date(
                    loan.approved_at
                  ).toLocaleDateString()}
                </span>
              </div>
            )}

            {loan.due_date && (
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Interest due
                </span>
                <span>
                  {new Date(
                    loan.due_date
                  ).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Countdown */}
          {daysRemaining !== null && (
            <div
              className={`mt-4 text-sm font-medium ${getCountdownColor()}`}
            >
              {daysRemaining > 0
                ? `${daysRemaining} day(s) left to pay interest`
                : "Interest payment overdue"}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
