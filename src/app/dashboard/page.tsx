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
  id: string;
  amount: number;
  total_repayment: number;
  status: string;
  approved_at: string | null;
  due_date: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

      const loanRes = await fetch("/api/get-customer-loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customerData.id }),
      });

      const loanData = await loanRes.json();

      if (loanData.success && loanData.loans) {
        setLoans(loanData.loans);
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

  function getDaysRemaining(dueDate: string | null) {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function copyLoanId(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const activeLoans = loans
    .filter((l) => l.status === "active" && l.due_date)
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() -
        new Date(b.due_date!).getTime()
    );

  const pendingLoans = loans.filter((l) => l.status === "pending");

  const mainLoan = activeLoans[0] || null;
  const otherLoans =
    activeLoans.length > 1
      ? activeLoans.slice(1)
      : [];

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

      {/* Request button */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/request-loan")}
          className="px-5 py-3 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition"
        >
          Request Another Loan
        </button>
      </div>

      {/* Pending loans */}
      {pendingLoans.map((loan) => (
        <div
          key={loan.id}
          className="rounded-xl border border-gray-800 p-6 bg-[#020617] mb-4"
        >
          <p className="text-gray-400 text-sm mb-2">
            Pending approval
          </p>
          <p className="text-2xl font-semibold">
            ₹{loan.amount.toLocaleString()}
          </p>
        </div>
      ))}

      {/* Main active loan */}
      {mainLoan && (
        <div className="rounded-xl border border-gray-800 p-6 bg-[#020617] mb-6">
          <p className="text-gray-400 text-sm mb-2">
            Active loan
          </p>

          <p className="text-2xl font-semibold mb-4">
            ₹{mainLoan.amount.toLocaleString()}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">
                Total repayment
              </span>
              <span className="font-semibold">
                ₹{mainLoan.total_repayment.toLocaleString()}
              </span>
            </div>

            {mainLoan.due_date && (
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Due date
                </span>
                <span>
                  {new Date(
                    mainLoan.due_date
                  ).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-400">
                Loan ID
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs">
                  {mainLoan.id}
                </span>
                <button
                  onClick={() => copyLoanId(mainLoan.id)}
                  className="text-yellow-400 text-xs"
                >
                  Copy
                </button>
              </div>
            </div>

            {copiedId === mainLoan.id && (
              <p className="text-green-400 text-xs">
                Loan ID copied
              </p>
            )}
          </div>

          <button
            onClick={() => router.push("/pay-loan")}
            className="mt-6 w-full py-3 rounded-lg bg-yellow-500 text-black font-medium"
          >
            Pay this loan
          </button>
        </div>
      )}

      {/* Other loans */}
      {otherLoans.length > 0 && (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Other loans
          </p>

          {otherLoans.map((loan) => (
            <div
              key={loan.id}
              className="rounded-xl border border-gray-800 p-4 bg-[#020617]"
            >
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Amount
                </span>
                <span>
                  ₹{loan.amount.toLocaleString()}
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
          ))}
        </div>
      )}
    </main>
  );
}
