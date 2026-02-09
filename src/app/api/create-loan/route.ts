import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { customerId, amount, totalRepayment } =
      await req.json();

    // Base logic
    const monthlyInterestRate = 15; // 15%
    const interest = Math.round(amount * (monthlyInterestRate / 100));

    const { error } = await supabase.from("loans").insert({
      customer_id: customerId,
      amount,
      total_repayment: totalRepayment,
      status: "pending",

      // Required columns
      base_interest: interest,
      monthly_interest: monthlyInterestRate,
      plan_name: "Standard Loan",
      duration_days: 30,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
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
