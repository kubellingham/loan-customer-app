"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDeviceId } from "@/lib/device";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  // 🔐 Auto-login check
  useEffect(() => {
    async function checkSession() {
      const deviceId = getDeviceId();

      const res = await fetch("/api/check-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      const data = await res.json();

      if (data.active) {
        router.push("/dashboard");
        return;
      }

      setCheckingSession(false);
    }

    checkSession();
  }, [router]);

  async function handleContinue() {
    if (!phone) {
      alert("Please enter your phone number");
      return;
    }

    const { data } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (data) {
      router.push(`/otp?phone=${phone}`);
    } else {
      router.push(`/register?phone=${phone}`);
    }
  }

  // ⏳ While checking session
  if (checkingSession) {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <p className="text-gray-400">Checking session…</p>
      </main>
    );
  }

  // 📱 Phone login UI
  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center px-4 text-white">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-2">
          Welcome 👋
        </h1>

        <p className="text-gray-400 mb-8">
          Enter your phone number to continue
        </p>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Phone number
          </label>

          <input
            type="tel"
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#020617] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition"
        >
          Continue
        </button>

        <p className="text-xs text-gray-500 mt-6 text-center">
          We’ll verify your number via OTP
        </p>
      </div>
    </main>
  );
}
