import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { customerId, amount } = await req.json();

    if (!customerId || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing data" },
        { status: 400 }
      );
    }

    // 1. Check if customer already has pending or active loan
    const { data: existingLoan, error: checkError } =
      await supabase
        .from("loans")
        .select("id, status")
        .eq("customer_id", customerId)
        .in("status", ["pending", "active"])
        .limit(1)
        .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        { success: false, error: checkError.message },
        { status: 500 }
      );
    }

    if (existingLoan) {
      return NextResponse.json({
        success: false,
        error:
          "You already have a pending or active loan.",
      });
    }

    // 2. Calculate repayment (15% for 30 days)
    const totalRepayment = Math.round(amount * 1.15);

    // 3. Insert new loan
    const { error: insertError } = await supabase
      .from("loans")
      .insert({
        customer_id: customerId,
        amount,
        total_repayment: totalRepayment,
        monthly_interest: 15,
        duration_days: 30,
        status: "pending",
      });

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
