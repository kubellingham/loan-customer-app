import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("loans")
      .select(
        "amount, total_repayment, monthly_interest, duration_days, status, approved_at, due_date, final_deadline"
      )
      .eq("customer_id", customerId)
      .eq("status", "approved") // only approved loans
      .order("approved_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      loan: data || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
