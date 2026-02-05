import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { phone, otp, deviceId, rememberDevice } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: "Phone and OTP required" },
        { status: 400 }
      );
    }

    // 🔍 Get latest valid OTP
    const { data: otpRow, error } = await supabase
      .from("otp_requests")
      .select("*")
      .eq("phone", phone)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !otpRow) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // ⏱️ Expiry check
    if (new Date(otpRow.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: "OTP expired" },
        { status: 400 }
      );
    }

    // ❌ Wrong OTP
    if (otpRow.otp_code !== otp) {
      await supabase
        .from("otp_requests")
        .update({ attempts: otpRow.attempts + 1 })
        .eq("id", otpRow.id);

      return NextResponse.json(
        { success: false, error: "Incorrect OTP" },
        { status: 400 }
      );
    }

    // ✅ Mark OTP as used
    await supabase
      .from("otp_requests")
      .update({ used: true })
      .eq("id", otpRow.id);

    // 👤 Get customer
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .single();

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 400 }
      );
    }

    // 💾 Create session ONLY if remembered
    if (rememberDevice) {
      await supabase
        .from("customer_sessions")
        .update({ active: false })
        .eq("customer_id", customer.id);

      await supabase.from("customer_sessions").insert({
        customer_id: customer.id,
        device_id: deviceId,
      });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
