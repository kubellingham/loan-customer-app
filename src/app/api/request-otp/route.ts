import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number required" },
        { status: 400 }
      );
    }

    // 🔍 Check for existing valid OTP
    const { data: existingOtp } = await supabase
      .from("otp_requests")
      .select("*")
      .eq("phone", phone)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingOtp) {
      console.log(`Reusing OTP for ${phone}: ${existingOtp.otp_code}`);
      return NextResponse.json({ success: true });
    }

    // 🔐 Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    ).toISOString();

    const { error } = await supabase.from("otp_requests").insert({
      phone,
      otp_code: otp,
      expires_at: expiresAt,
    });

    if (error) {
      console.error("OTP insert error:", error);
      return NextResponse.json(
        { error: "Failed to generate OTP" },
        { status: 500 }
      );
    }

    console.log(`OTP for ${phone}: ${otp}`);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Request OTP error:", err);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
