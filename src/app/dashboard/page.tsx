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

  // Separate loans
  const activeLoans = loans
    .filter((l) => l.status === "active" && l.due_date)
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() -
        new Date(b.due_date!).getTime()
    );

  const mainLoan = activeLoans[0] || null;
  const otherLoans = loans.filter(
    (l) => !mainLoan || l.id !== mainLoan.id
  );

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

      {/* Request button */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/request-loan")}
          className="px-5 py-3 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition"
        >
          Request Another Loan
        </button>
      </div>

      {loans.length === 0 && (
        <div className="rounded-xl border border-gray-800 p-6 bg-[#020617]">
          <p className="text-gray-400">
            You have no active loan.
          </p>
        </div>
      )}

      {/* Main active loan */}
      {mainLoan && (
        <div className="rounded-xl border border-gray-800 p-6 bg-[#020617] mb-6">
          <p className="text-gray-400 text-sm mb-2">
            Most urgent loan
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
          </div>

          {/* Countdown */}
          {mainLoan.due_date && (
            <div className="mt-4 text-sm font-medium">
              {(() => {
                const days = getDaysRemaining(
                  mainLoan.due_date
                );
                if (days === null) return null;

                if (days > 0)
                  return `${days} day(s) remaining`;
                if (days === 0) return "Due today";
                return `Overdue by ${Math.abs(days)} days`;
              })()}
            </div>
          )}
        </div>
      )}

      {/* Other loans (expandable) */}
      {otherLoans.length > 0 && (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Other loans
          </p>

          {otherLoans.map((loan) => {
            const isExpanded =
              expandedLoanId === loan.id;

            return (
              <div
                key={loan.id}
                className="rounded-xl border border-gray-800 bg-[#020617]"
              >
                {/* Header */}
                <div
                  onClick={() =>
                    setExpandedLoanId(
                      isExpanded ? null : loan.id
                    )
                  }
                  className="p-4 cursor-pointer"
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

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 text-sm border-t border-gray-800 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        Loan ID
                      </span>
                      <span className="font-mono text-xs">
                        {loan.id}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        Total repayment
                      </span>
                      <span>
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
                          Return by
                        </span>
                        <span>
                          {new Date(
                            loan.due_date
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Pay button */}
                    {loan.status === "active" && (
                      <button
                        onClick={() =>
                          alert(
                            `To pay this loan, contact support and send this Loan ID with your payment proof:\n\n${loan.id}`
                          )
                        }
                        className="w-full mt-2 py-2 rounded-lg bg-green-500 text-black font-medium hover:bg-green-400 transition"
                      >
                        Pay this loan
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
