"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "@/lib/device";

type Customer = {
  full_name: string;
  state: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validateSession() {
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

      setCustomer({
        full_name: data.customer.full_name,
        state: data.customer.state,
      });

      setLoading(false);
    }

    validateSession();
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
      {/* 🔓 Logout */}
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
        <p className="text-gray-500">
          Your dashboard is ready. More features coming soon.
        </p>
      </div>
    </main>
  );
}
