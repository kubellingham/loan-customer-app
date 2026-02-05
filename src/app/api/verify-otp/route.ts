import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { phone, otp, deviceId } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: "Phone and OTP required" },
        { status: 400 }
      );
    }

    // Get latest valid OTP
    const { data: otpRow, error: otpError } = await supabase
      .from("otp_requests")
      .select("*")
      .eq("phone", phone)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRow) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date(otpRow.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: "OTP expired" },
        { status: 400 }
      );
    }

    // Check OTP match
    if (otpRow.otp_code !== otp) {
      return NextResponse.json(
        { success: false, error: "Incorrect OTP" },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await supabase
      .from("otp_requests")
      .update({ used: true })
      .eq("id", otpRow.id);

    // 🔎 Get customer
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 400 }
      );
    }

    // 🔴 Deactivate all previous sessions
    await supabase
      .from("customer_sessions")
      .update({ active: false })
      .eq("customer_id", customer.id);

    // ✅ Create new active session
    await supabase.from("customer_sessions").insert({
      customer_id: customer.id,
      device_id: deviceId,
      active: true,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
