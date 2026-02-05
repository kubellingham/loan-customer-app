import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { deviceId } = await req.json();

    if (!deviceId) {
      return NextResponse.json({ success: false });
    }

    await supabase
      .from("customer_sessions")
      .update({ active: false })
      .eq("device_id", deviceId);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ success: false });
  }
}
