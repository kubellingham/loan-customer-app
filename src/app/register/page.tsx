"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const params = useSearchParams();
  const phone = params.get("phone") || "";
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");

  async function handleRegister() {
    if (!fullName || !dob) {
      alert("Please fill required fields");
      return;
    }

    const { error } = await supabase.from("customers").insert({
      phone,
      full_name: fullName,
      date_of_birth: dob,
      email: email || null,
      state: "active",
    });

    if (error) {
      alert("Registration failed. Phone may already exist.");
      return;
    }

    // After registration → OTP
    router.push(`/otp?phone=${phone}`);
  }

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center px-4 text-white">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6">Create Account</h1>

        <p className="text-gray-400 mb-4">
          Phone: <span className="text-white">{phone}</span>
        </p>

        <input
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
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-lg bg-[#020617] border border-gray-700"
        />

        <button
          onClick={handleRegister}
          className="w-full py-3 rounded-lg bg-yellow-500 text-black font-medium"
        >
          Continue
        </button>
      </div>
    </main>
  );
}
