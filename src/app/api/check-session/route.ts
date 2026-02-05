import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { deviceId } = await req.json();

    if (!deviceId) {
      return NextResponse.json({ active: false });
    }

    const { data: session } = await supabase
      .from("customer_sessions")
      .select(`
        id,
        customers (
          id,
          full_name,
          phone,
          state
        )
      `)
      .eq("device_id", deviceId)
      .eq("active", true)
      .single();

    if (!session || !session.customers) {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({
      active: true,
      customer: session.customers,
    });

  } catch (err) {
    console.error("Check session error:", err);
    return NextResponse.json({ active: false });
  }
}
