"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDeviceId } from "@/lib/device";

export default function OtpClient() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone");
  const otpRequestedRef = useRef(false);
  const deviceId = getDeviceId();

  // Request OTP once
  useEffect(() => {
    if (!phone) return;
    if (otpRequestedRef.current) return;
    otpRequestedRef.current = true;

    fetch("/api/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
  }, [phone]);

  async function handleVerify() {
    if (!otp || otp.length !== 6) {
      alert("Enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp, deviceId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      alert(data.error || "OTP verification failed");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center px-4 text-white">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-4">Enter OTP</h1>

        <p className="text-gray-400 mb-6">
          Sent to {phone}
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          className="w-full mb-6 px-4 py-3 text-center tracking-widest text-lg rounded-lg bg-[#020617] border border-gray-700"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-yellow-500 text-black font-medium"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </main>
  );
}
