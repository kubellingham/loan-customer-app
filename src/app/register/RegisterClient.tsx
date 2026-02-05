"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterClient() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone");

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName || !dob || !phone) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("customers")
      .insert({
        full_name: fullName,
        phone,
        dob,
        email: email || null,
        state: "active",
      })
      .select();

    setLoading(false);

    if (error) {
      alert("Registration failed: " + error.message);
      console.error("Registration error:", error);
      return;
    }

    router.push(`/otp?phone=${phone}`);
  }

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center px-4 text-white">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6">
          Create your account
        </h1>

        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-[#020617] border border-gray-700"
        />

        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-[#020617] border border-gray-700"
        />

        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-lg bg-[#020617] border border-gray-700"
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-yellow-500 text-black font-medium"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </div>
    </main>
  );
}
