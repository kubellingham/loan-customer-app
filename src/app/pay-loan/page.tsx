"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PayLoanPage() {
  const router = useRouter();
  const [loanId, setLoanId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!loanId) {
      alert("Please enter your Loan ID");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/request-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loanId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      alert(data.error || "Failed to submit request");
      return;
    }

    alert("Payment request sent. Please wait for confirmation.");
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center px-4 text-white">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-4">
          Pay your loan
        </h1>

        <p className="text-gray-400 mb-6 text-sm">
          Send the full repayment to our company account.
          Then enter your Loan ID below to notify support.
        </p>

        <input
          type="text"
          placeholder="Enter Loan ID"
          value={loanId}
          onChange={(e) => setLoanId(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-lg bg-[#020617] border border-gray-700"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-yellow-500 text-black font-medium"
        >
          {loading ? "Submitting..." : "Notify payment"}
        </button>
      </div>
    </main>
  );
}
